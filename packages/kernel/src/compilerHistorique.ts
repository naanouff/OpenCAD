import { evaluer } from './evaluateur.ts'
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
  type CercleEsquisse,
  type EsquisseKernel,
  type PolygoneEsquisse,
  type RectangleEsquisse,
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
  | { type: 'cercle'; id?: string }
  | { type: 'polygone'; pans: number; id?: string }
  | { type: 'hexagone'; id?: string }
  | { type: 'octogone'; id?: string }
  | {
      type: 'cote'
      cible: 'longueur' | 'largeur' | 'rayon' | 'hauteur' | 'diametre' | 'entreplat'
      expression: string
    }
  | { type: 'extrude'; profondeur: string }
  | { type: 'revolution' }
  | { type: 'enlever'; profondeur: string }
  | { type: 'fillet'; rayon: string; indices?: number[] | null }

export type CompilationKernel = {
  ops: KernelBatchOp[]
  solidAs: string | null
  parametres: Map<string, string>
}

type SegmentProfil = { id: string; rayon?: string; hauteur?: string }

type EsquisseEnCours = {
  support: string
  rectangles: RectangleEsquisse[]
  segments: SegmentProfil[]
  cercles: CercleEsquisse[]
  polygones: PolygoneEsquisse[]
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
  segments: SegmentProfil[],
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

export type OptionsCompilation = {
  /**
   * Unité des expressions sketch / profondeur / rayons.
   * - `m` (défaut) : mètres → OCCT mm via ×1000 (goldens K3)
   * - `mm` : millimètres (Session éditeur) → OCCT mm via ×1
   */
  unite?: 'm' | 'mm'
}

/**
 * Compile un préfixe d’historique (param / esquisse / extrude / revolution / enlever / fillet)
 * en batch occt-kernel. Hors scope : carrure barrettes, pas hybride.
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
        cercles: [],
        polygones: [],
      }
      continue
    }
    if (operation.type === 'rectangle') {
      if (!esquisse) throw new Error('rectangle hors esquisse')
      esquisse.rectangles.push({ id: operation.id ?? `r${uid++}` })
      continue
    }
    if (operation.type === 'segment') {
      if (!esquisse) throw new Error('segment hors esquisse')
      esquisse.segments.push({ id: operation.id ?? `s${uid++}` })
      continue
    }
    if (operation.type === 'cercle') {
      if (!esquisse) throw new Error('cercle hors esquisse')
      esquisse.cercles.push({ id: operation.id ?? `c${uid++}` })
      continue
    }
    if (operation.type === 'polygone' || operation.type === 'hexagone' || operation.type === 'octogone') {
      if (!esquisse) throw new Error('polygone hors esquisse')
      const pans =
        operation.type === 'polygone' ? operation.pans : operation.type === 'hexagone' ? 6 : 8
      if (!(pans >= 3)) throw new Error('polygone pans invalide')
      esquisse.polygones.push({ id: operation.id ?? `p${uid++}`, pans })
      continue
    }
    if (operation.type === 'cote') {
      if (!esquisse) throw new Error('cote hors esquisse')
      if (operation.cible === 'longueur' || operation.cible === 'largeur') {
        const dernier = esquisse.rectangles.at(-1)
        if (!dernier) throw new Error('cote sans rectangle')
        if (operation.cible === 'longueur') dernier.longueur = operation.expression
        else dernier.largeur = operation.expression
        continue
      }
      if (operation.cible === 'rayon' || operation.cible === 'hauteur') {
        const dernier = esquisse.segments.at(-1)
        if (!dernier) throw new Error('cote sans segment')
        if (operation.cible === 'rayon') dernier.rayon = operation.expression
        else dernier.hauteur = operation.expression
        continue
      }
      if (operation.cible === 'entreplat') {
        const dernier = esquisse.polygones.at(-1)
        if (!dernier) throw new Error('cote entreplat sans polygone')
        dernier.entreplat = operation.expression
        continue
      }
      const cercle = esquisse.cercles.at(-1)
      if (!cercle) throw new Error('cote diametre sans cercle')
      cercle.diametre = operation.expression
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
      }
      const resolue = resoudreEsquisse(sketch, parametres)
      exigerContraint(resolue)
      const profondeurMm = profondeur * scale
      const face = faces.get(esquisse.support)
      const yPlan = face ? yPlanFace(face) : 0
      const dir = face
        ? directionExtrude(face, profondeurMm)
        : ([0, profondeurMm, 0] as const)
      const polys = polylinesDepuisResolue(resolue, { yPlan, echelle: scale })
      if (polys.length === 1) {
        const feat = opsExtrude(polys[0] as Polyline3, dir, String(uid++))
        ops.push(...feat.ops)
        const attach = accrocherSolide(solidAs, feat.as, String(uid++))
        ops.push(...attach.ops)
        solidAs = attach.solidAs
      } else {
        // Anneau : extrude extérieur puis coupe les intérieurs (GCS multi-cercles).
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
      if (face) {
        const yFin = face.origin[1] + face.normal[1] * profondeurMm
        yMax = Math.max(yMax, yFin, face.origin[1])
        yMin = Math.min(yMin, yFin, face.origin[1])
      } else {
        yMax = Math.max(yMax, profondeurMm)
        yMin = Math.min(yMin, 0)
      }
      faces = faceDepuisBornesY(yMin, yMax)
      esquisse = null
      continue
    }
    if (operation.type === 'revolution') {
      if (!esquisse) throw new Error('revolution sans esquisse')
      const profil = profilRevolution(esquisse.segments, parametres, scale)
      const feat = opsRevolution(profil, String(uid++))
      ops.push(...feat.ops)
      const attach = accrocherSolide(solidAs, feat.as, String(uid++))
      ops.push(...attach.ops)
      solidAs = attach.solidAs
      for (const s of esquisse.segments) {
        if (s.hauteur) yMax = Math.max(yMax, evaluer(s.hauteur, parametres) * scale)
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
      const sketch: EsquisseKernel = { cercles: esquisse.cercles.map((c) => ({ ...c })) }
      const resolue = resoudreEsquisse(sketch, parametres)
      exigerContraint(resolue)
      const profondeurMm = profondeur * scale
      const face = faces.get(esquisse.support)
      const yCut = face ? yPlanCoupe(face, profondeurMm) : yMax - profondeurMm
      const dir = face
        ? directionCoupe(face, profondeurMm)
        : ([0, profondeurMm + 0.4, 0] as const)
      const polys = polylinesDepuisResolue(resolue, { yPlan: yCut, echelle: scale })
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

  return { ops, solidAs, parametres }
}
