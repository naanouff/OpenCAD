import { opsBarrettesPedagogiques } from './barrettesKernel.ts'
import { opsElevationCornes } from './elevationCornes.ts'
import { evaluer } from './evaluateur.ts'
import {
  CHEVAUCHE_TUBE,
  datumParId,
  directionDatum,
} from './datumsKernel.ts'
import {
  accrocherSolide,
  opsCouper,
  opsExtrude,
  opsFillet,
  opsRevolution,
  type Polyline3,
} from './opsDepuisFonction.ts'
import { polylinesDepuisResolue } from './polylinesDepuisResolue.ts'
import {
  directionCoupe,
  directionExtrude,
  faceDepuisBornesY,
  yPlanCoupe,
  yPlanFace,
  type RegistreFaces,
} from './registreFaces.ts'
import {
  exigerContraint,
  resoudreEsquisse,
  type ArcEsquisse,
  type CercleEsquisse,
  type EsquisseKernel,
  type PolygoneEsquisse,
  type RectangleEsquisse,
  type SegmentEsquisse,
  type SymetrieAxe,
} from './sketchSolve.ts'
import type { KernelBatchOp } from './types.ts'

/**
 * DTO historique Session-free (extrait éditeur `pipelineOcct.compiler`).
 * Unités sketch / profondeur / rayon : mètres (même convention K3-5).
 */
export type OperationKernel =
  | { type: 'param'; nom: string; expression: string }
  | { type: 'ouvrir'; support?: string }
  | { type: 'rectangle'; id?: string }
  | { type: 'segment'; id?: string }
  | { type: 'arc'; id?: string }
  | { type: 'cercle'; id?: string }
  | { type: 'polygone'; pans: number; id?: string }
  | { type: 'hexagone'; id?: string }
  | { type: 'octogone'; id?: string }
  | {
      type: 'cote'
      cible:
        | 'longueur'
        | 'largeur'
        | 'rayon'
        | 'hauteur'
        | 'diametre'
        | 'entreplat'
        | 'ecart'
        | 'debord'
      expression: string
    }
  | { type: 'concentrique'; cible: string }
  | { type: 'symetrie'; axe: SymetrieAxe }
  | { type: 'extrude'; profondeur: string }
  | { type: 'revolution' }
  | { type: 'pas' }
  | { type: 'enlever'; profondeur: string; traverse?: boolean }
  | { type: 'fillet'; rayon: string; indices?: number[] | null }

/** Profil corps pour filet hôte (expressions sketch, non évaluées). */
export type ProfilPas = { id: string; rayon?: string; hauteur?: string }

export type CompilationKernel = {
  ops: KernelBatchOp[]
  solidAs: string | null
  parametres: Map<string, string>
  /** `pas` : 1re revolution omise cote OCCT (filet Session). */
  pas: boolean
  /** Segments du 1er profil revolution quand `pas` (pour filetHote). */
  entitesPas: ProfilPas[] | null
  yMin: number
  yMax: number
}

type EsquisseEnCours = {
  support: string
  rectangles: RectangleEsquisse[]
  segments: SegmentEsquisse[]
  arcs: ArcEsquisse[]
  cercles: CercleEsquisse[]
  polygones: PolygoneEsquisse[]
  symetries: SymetrieAxe[]
  dernier:
    | { sorte: 'rectangle'; ref: RectangleEsquisse }
    | { sorte: 'segment'; ref: SegmentEsquisse }
    | { sorte: 'arc'; ref: ArcEsquisse }
    | { sorte: 'cercle'; ref: CercleEsquisse }
    | { sorte: 'polygone'; ref: PolygoneEsquisse }
    | null
}

function rayonApprox(poly: Polyline3): number {
  let max = 0
  for (let i = 0; i < poly.length; i += 3) {
    max = Math.max(max, Math.hypot(poly[i]!, poly[i + 2]!))
  }
  return max
}

function fermerXy(xyz: Polyline3): Polyline3 {
  if (xyz.length < 6) return xyz
  const n = xyz.length
  if (
    Math.abs(xyz[0]! - xyz[n - 3]!) < 1e-9 &&
    Math.abs(xyz[1]! - xyz[n - 2]!) < 1e-9 &&
    Math.abs(xyz[2]! - xyz[n - 1]!) < 1e-9
  ) {
    return xyz
  }
  return [...xyz, xyz[0]!, xyz[1]!, xyz[2]!]
}

/** Profil révolution XY (mm OCCT) depuis segments rayon/hauteur (unités sketch). */
function profilRevolution(
  segments: SegmentEsquisse[],
  parametres: Map<string, string>,
  scale: number,
): Polyline3 {
  if (segments.length < 2) throw new Error('profil révolution trop court')
  const xyz: number[] = []
  for (const s of segments) {
    if (s.rayon === undefined || s.hauteur === undefined) {
      throw new Error('segment sans rayon/hauteur')
    }
    xyz.push(evaluer(s.rayon, parametres) * scale, evaluer(s.hauteur, parametres) * scale, 0)
  }
  return fermerXy(xyz)
}

function altitudeDatum(
  support: string,
  parametres: Map<string, string>,
  scale: number,
): number {
  if (support === 'plan.3h' && parametres.has('diametre_boite')) {
    return evaluer('diametre_boite', parametres) * scale * 0.5 - CHEVAUCHE_TUBE
  }
  return 0
}

function decalageTube(
  support: string,
  parametres: Map<string, string>,
  scale: number,
): readonly [number, number, number] {
  if (support === 'plan.3h' && parametres.has('hauteur_carrure')) {
    return [0, (evaluer('hauteur_carrure', parametres) * scale) / 2, 0]
  }
  return [0, 0, 0]
}

function decalerPolylines(polys: Polyline3[], dx: number, dy: number, dz: number): Polyline3[] {
  if (dx === 0 && dy === 0 && dz === 0) return polys
  return polys.map((poly) => {
    const out: number[] = []
    for (let i = 0; i < poly.length; i += 3) {
      out.push(poly[i]! + dx, poly[i + 1]! + dy, poly[i + 2]! + dz)
    }
    return out
  })
}

export type OptionsCompilation = {
  /**
   * Unité des expressions sketch / profondeur / rayons.
   * - `m` (défaut) : mètres → OCCT mm via ×1000 (goldens K3)
   * - `mm` : millimètres (Session éditeur) → OCCT mm via ×1
   */
  unite?: 'm' | 'mm'
}

/**
 * Compile un préfixe d’historique (param / esquisse / extrude / revolution / pas / enlever / fillet)
 * en batch occt-kernel. `pas` : corps omis en OCCT, profil exposé pour filet hôte.
 */
export function compilerHistorique(
  historique: OperationKernel[],
  options: OptionsCompilation = {},
): CompilationKernel {
  const scale = options.unite === 'mm' ? 1 : 1000
  const parametres = new Map<string, string>()
  const ops: KernelBatchOp[] = []
  let solidAs: string | null = null
  let esquisse: EsquisseEnCours | null = null
  let uid = 0
  let yMax = 0
  let yMin = 0
  let faces: RegistreFaces = new Map()
  const pas = historique.some((op) => op.type === 'pas')
  let entitesPas: ProfilPas[] | null = null
  let revolutions = 0

  for (const operation of historique) {
    if (operation.type === 'param') {
      parametres.set(operation.nom, operation.expression)
      continue
    }
    if (operation.type === 'ouvrir') {
      esquisse = {
        support: operation.support ?? 'plan.dessus',
        rectangles: [],
        segments: [],
        arcs: [],
        cercles: [],
        polygones: [],
        symetries: [],
        dernier: null,
      }
      continue
    }
    if (operation.type === 'rectangle') {
      if (!esquisse) throw new Error('rectangle hors esquisse')
      const ref = { id: operation.id ?? `r${uid++}` }
      esquisse.rectangles.push(ref)
      esquisse.dernier = { sorte: 'rectangle', ref }
      continue
    }
    if (operation.type === 'segment') {
      if (!esquisse) throw new Error('segment hors esquisse')
      const ref = { id: operation.id ?? `s${uid++}` }
      esquisse.segments.push(ref)
      esquisse.dernier = { sorte: 'segment', ref }
      continue
    }
    if (operation.type === 'arc') {
      if (!esquisse) throw new Error('arc hors esquisse')
      const ref = { id: operation.id ?? `a${uid++}` }
      esquisse.arcs.push(ref)
      esquisse.dernier = { sorte: 'arc', ref }
      continue
    }
    if (operation.type === 'cercle') {
      if (!esquisse) throw new Error('cercle hors esquisse')
      const ref = { id: operation.id ?? `c${uid++}` }
      esquisse.cercles.push(ref)
      esquisse.dernier = { sorte: 'cercle', ref }
      continue
    }
    if (operation.type === 'polygone' || operation.type === 'hexagone' || operation.type === 'octogone') {
      if (!esquisse) throw new Error('polygone hors esquisse')
      const pans =
        operation.type === 'polygone' ? operation.pans : operation.type === 'hexagone' ? 6 : 8
      if (!(pans >= 3)) throw new Error('polygone pans invalide')
      const ref = { id: operation.id ?? `p${uid++}`, pans }
      esquisse.polygones.push(ref)
      esquisse.dernier = { sorte: 'polygone', ref }
      continue
    }
    if (operation.type === 'cote') {
      if (!esquisse?.dernier) throw new Error('cote hors esquisse')
      const d = esquisse.dernier
      const { cible, expression } = operation
      if (cible === 'longueur' && d.sorte === 'rectangle') {
        d.ref.longueur = expression
        continue
      }
      if (cible === 'largeur' && (d.sorte === 'rectangle' || d.sorte === 'segment')) {
        d.ref.largeur = expression
        continue
      }
      if (cible === 'rayon' && (d.sorte === 'segment' || d.sorte === 'arc')) {
        d.ref.rayon = expression
        continue
      }
      if (cible === 'hauteur' && d.sorte === 'segment') {
        d.ref.hauteur = expression
        continue
      }
      if (cible === 'ecart' && d.sorte === 'segment') {
        d.ref.ecart = expression
        continue
      }
      if (cible === 'debord' && d.sorte === 'segment') {
        d.ref.debord = expression
        continue
      }
      if (cible === 'entreplat' && d.sorte === 'polygone') {
        d.ref.entreplat = expression
        continue
      }
      if (cible === 'diametre' && d.sorte === 'cercle') {
        d.ref.diametre = expression
        continue
      }
      throw new Error(`cote ${cible} incompatible avec ${d.sorte}`)
    }
    if (operation.type === 'concentrique') {
      if (!esquisse?.dernier) throw new Error('concentrique hors esquisse')
      if (esquisse.dernier.sorte === 'cercle' || esquisse.dernier.sorte === 'arc') {
        esquisse.dernier.ref.concentrique = operation.cible
        continue
      }
      throw new Error('concentrique sans cercle/arc')
    }
    if (operation.type === 'symetrie') {
      if (!esquisse) throw new Error('symetrie hors esquisse')
      esquisse.symetries.push(operation.axe)
      continue
    }
    if (operation.type === 'extrude') {
      if (!esquisse) throw new Error('extrude sans esquisse')
      const profondeur = evaluer(operation.profondeur, parametres)
      if (!(profondeur > 0)) throw new Error('profondeur doit être positive')
      const sketch: EsquisseKernel = {
        rectangles: esquisse.rectangles.map((r) => ({ ...r })),
        cercles: esquisse.cercles.map((c) => ({ ...c })),
        polygones: esquisse.polygones.map((p) => ({ ...p })),
        segments: esquisse.segments.map((s) => ({ ...s })),
        arcs: esquisse.arcs.map((a) => ({ ...a })),
        symetries: [...esquisse.symetries],
      }
      const resolue = resoudreEsquisse(sketch, parametres)
      exigerContraint(resolue)
      const profondeurMm = profondeur * scale
      const face = faces.get(esquisse.support)
      const tubeLateral = esquisse.support === 'plan.3h'
      const longueurExtrude = tubeLateral ? profondeurMm + CHEVAUCHE_TUBE : profondeurMm
      const yPlan = face
        ? yPlanFace(face)
        : altitudeDatum(esquisse.support, parametres, scale)
      const dir = face
        ? directionExtrude(face, longueurExtrude)
        : directionDatum(esquisse.support, longueurExtrude)
      let polys = polylinesDepuisResolue(resolue, {
        yPlan,
        echelle: scale,
        support: datumParId(esquisse.support) ? esquisse.support : undefined,
      })
      if (tubeLateral) {
        const [dx, dy, dz] = decalageTube(esquisse.support, parametres, scale)
        polys = decalerPolylines(polys, dx, dy, dz)
      }
      // Anneau : ≥2 cercles. Cornes (4 polylines) : fuse chaque extrude.
      const anneau = esquisse.cercles.length >= 2 && polys.length >= 2 && !tubeLateral
      const profilCorne = esquisse.segments.some((s) => s.ecart !== undefined)
      if (!anneau) {
        for (const poly of polys) {
          const feat = opsExtrude(poly, dir, String(uid++))
          ops.push(...feat.ops)
          const attach = accrocherSolide(solidAs, feat.as, String(uid++))
          ops.push(...attach.ops)
          solidAs = attach.solidAs
        }
        if (profilCorne && solidAs) {
          const elev = opsElevationCornes(solidAs, parametres, scale, () => String(uid++))
          ops.push(...elev.ops)
          solidAs = elev.solidAs
        }
      } else {
        const classes = polys
          .map((poly) => ({ poly, r: rayonApprox(poly) }))
          .sort((a, b) => b.r - a.r)
        const exterieur = classes[0]!
        const feat = opsExtrude(exterieur.poly, dir, String(uid++))
        ops.push(...feat.ops)
        const attach = accrocherSolide(solidAs, feat.as, String(uid++))
        ops.push(...attach.ops)
        solidAs = attach.solidAs
        for (const interieur of classes.slice(1)) {
          const outil = opsExtrude(
            interieur.poly,
            [dir[0], dir[1] + Math.sign(dir[1] || 1) * 0.4, dir[2]],
            String(uid++),
          )
          ops.push(...outil.ops)
          const cut = opsCouper(solidAs!, outil.as, String(uid++))
          ops.push(...cut.ops)
          solidAs = cut.solidAs
        }
      }
      if (!tubeLateral) {
        if (face) {
          const yFin = face.origin[1] + face.normal[1] * profondeurMm
          yMax = Math.max(yMax, yFin, face.origin[1])
          yMin = Math.min(yMin, yFin, face.origin[1])
        } else {
          yMax = Math.max(yMax, profondeurMm)
          yMin = Math.min(yMin, 0)
        }
        faces = faceDepuisBornesY(yMin, yMax)
      }
      esquisse = null
      continue
    }
    if (operation.type === 'pas') {
      continue
    }
    if (operation.type === 'revolution') {
      if (!esquisse) throw new Error('revolution sans esquisse')
      const profil = profilRevolution(esquisse.segments, parametres, scale)
      const feat = opsRevolution(profil, String(uid++))
      revolutions += 1
      for (const s of esquisse.segments) {
        if (s.hauteur) yMax = Math.max(yMax, evaluer(s.hauteur, parametres) * scale)
      }
      if (revolutions === 1) {
        entitesPas = esquisse.segments.map((s) => ({
          id: s.id,
          rayon: s.rayon,
          hauteur: s.hauteur,
        }))
        if (!pas) {
          ops.push(...feat.ops)
          const attach = accrocherSolide(solidAs, feat.as, String(uid++))
          ops.push(...attach.ops)
          solidAs = attach.solidAs
        }
      } else {
        ops.push(...feat.ops)
        const attach = accrocherSolide(solidAs, feat.as, String(uid++))
        ops.push(...attach.ops)
        solidAs = attach.solidAs
      }
      yMin = Math.min(yMin, 0)
      faces = faceDepuisBornesY(yMin, yMax)
      esquisse = null
      continue
    }
    if (operation.type === 'enlever') {
      if (!solidAs) throw new Error('enlever sans solide')
      if (!esquisse) throw new Error('enlever sans esquisse')
      const profondeur = evaluer(operation.profondeur, parametres)
      if (!(profondeur > 0)) throw new Error('profondeur enlever doit être positive')
      const profondeurMm = profondeur * scale
      if (operation.traverse && esquisse.support === 'plan.12h') {
        const cercle = [...esquisse.cercles].reverse().find((c) => c.diametre)
        if (!cercle?.diametre) throw new Error('barrette sans diamètre')
        const rayonMm = (evaluer(cercle.diametre, parametres) * scale) / 2
        const bars = opsBarrettesPedagogiques(solidAs, rayonMm, parametres, scale, () =>
          String(uid++),
        )
        ops.push(...bars.ops)
        solidAs = bars.solidAs
        esquisse = null
        continue
      }
      const sketch: EsquisseKernel = {
        rectangles: esquisse.rectangles.map((r) => ({ ...r })),
        cercles: esquisse.cercles.map((c) => ({ ...c })),
        polygones: esquisse.polygones.map((p) => ({ ...p })),
      }
      const resolue = resoudreEsquisse(sketch, parametres)
      exigerContraint(resolue)
      const face = faces.get(esquisse.support)
      const tubeLateral = esquisse.support === 'plan.3h'
      let yCut: number
      let dir: readonly [number, number, number]
      if (face) {
        yCut = yPlanCoupe(face, profondeurMm)
        dir = directionCoupe(face, profondeurMm)
      } else if (tubeLateral && operation.traverse) {
        yCut = -CHEVAUCHE_TUBE
        const portee =
          (parametres.has('diametre_boite')
            ? (evaluer('diametre_boite', parametres) * scale) / 2
            : 0) +
          profondeurMm +
          CHEVAUCHE_TUBE * 2
        dir = directionDatum(esquisse.support, portee)
      } else {
        yCut = yMax - profondeurMm
        dir = directionDatum(esquisse.support, profondeurMm + 0.4)
      }
      let polys = polylinesDepuisResolue(resolue, {
        yPlan: yCut,
        echelle: scale,
        support: datumParId(esquisse.support) ? esquisse.support : undefined,
      })
      if (tubeLateral) {
        const [dx, dy, dz] = decalageTube(esquisse.support, parametres, scale)
        polys = decalerPolylines(polys, dx, dy, dz)
      }
      for (const poly of polys) {
        const outil = opsExtrude(poly, dir, String(uid++))
        ops.push(...outil.ops)
        const cut = opsCouper(solidAs, outil.as, String(uid++))
        ops.push(...cut.ops)
        solidAs = cut.solidAs
      }
      esquisse = null
      continue
    }
    if (operation.type === 'fillet') {
      if (!solidAs) throw new Error('fillet sans solide')
      const rayon = evaluer(operation.rayon, parametres) * scale
      if (!(rayon > 0)) throw new Error('rayon fillet doit être positif')
      const indices = operation.indices === undefined ? null : operation.indices
      const feat = opsFillet(solidAs, rayon, indices, String(uid++))
      ops.push(...feat.ops)
      solidAs = feat.solidAs
      continue
    }
  }

  return { ops, solidAs, parametres, pas, entitesPas, yMin, yMax }
}
