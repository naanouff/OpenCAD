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
  exigerContraint,
  resoudreEsquisse,
  type EsquisseKernel,
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
  | {
      type: 'cote'
      cible: 'longueur' | 'largeur' | 'rayon' | 'hauteur' | 'diametre'
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
type CercleEsquisse = { id: string; diametre?: string }

type EsquisseEnCours = {
  support: string
  rectangles: RectangleEsquisse[]
  segments: SegmentProfil[]
  cercles: CercleEsquisse[]
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

/** Profil révolution XY (mm) depuis segments rayon/hauteur (m). */
function profilRevolutionMm(
  segments: SegmentProfil[],
  parametres: Map<string, string>,
): Polyline3 {
  if (segments.length < 2) throw new Error('profil révolution trop court')
  const xyz: number[] = []
  for (const s of segments) {
    if (s.rayon === undefined || s.hauteur === undefined) {
      throw new Error('segment sans rayon/hauteur')
    }
    xyz.push(evaluer(s.rayon, parametres) * 1000, evaluer(s.hauteur, parametres) * 1000, 0)
  }
  return fermerXy(xyz)
}

/** Cercle XZ (mm) pour coupe — même convention plaque O2-1. */
function cercleXzMm(rayonMm: number, y: number, segments = 48): Polyline3 {
  const xyz: number[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    xyz.push(Math.cos(a) * rayonMm, y, Math.sin(a) * rayonMm)
  }
  return fermerXy(xyz)
}

/**
 * Compile un préfixe d’historique (param / esquisse / extrude / revolution / enlever / fillet)
 * en batch occt-kernel. Hors scope : carrure barrettes, pas hybride.
 */
export function compilerHistorique(historique: OperationKernel[]): CompilationKernel {
  const parametres = new Map<string, string>()
  const ops: KernelBatchOp[] = []
  let solidAs: string | null = null
  let esquisse: EsquisseEnCours | null = null
  let uid = 0
  let yMax = 0
  let yMin = 0

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
      const cercle = esquisse.cercles.at(-1)
      if (!cercle) throw new Error('cote diametre sans cercle')
      cercle.diametre = operation.expression
      continue
    }
    if (operation.type === 'extrude') {
      if (!esquisse) throw new Error('extrude sans esquisse')
      const profondeur = evaluer(operation.profondeur, parametres)
      if (!(profondeur > 0)) throw new Error('profondeur doit être positive')
      const sketch: EsquisseKernel = { rectangles: esquisse.rectangles.map((r) => ({ ...r })) }
      const resolue = resoudreEsquisse(sketch, parametres)
      exigerContraint(resolue)
      const polys = polylinesDepuisResolue(resolue, { yPlan: 0, echelle: 1000 })
      const feat = opsExtrude(polys[0] as Polyline3, [0, profondeur * 1000, 0], String(uid++))
      ops.push(...feat.ops)
      const attach = accrocherSolide(solidAs, feat.as, String(uid++))
      ops.push(...attach.ops)
      solidAs = attach.solidAs
      yMax = Math.max(yMax, profondeur * 1000)
      yMin = Math.min(yMin, 0)
      esquisse = null
      continue
    }
    if (operation.type === 'revolution') {
      if (!esquisse) throw new Error('revolution sans esquisse')
      const profil = profilRevolutionMm(esquisse.segments, parametres)
      const feat = opsRevolution(profil, String(uid++))
      ops.push(...feat.ops)
      const attach = accrocherSolide(solidAs, feat.as, String(uid++))
      ops.push(...attach.ops)
      solidAs = attach.solidAs
      for (const s of esquisse.segments) {
        if (s.hauteur) yMax = Math.max(yMax, evaluer(s.hauteur, parametres) * 1000)
      }
      yMin = Math.min(yMin, 0)
      esquisse = null
      continue
    }
    if (operation.type === 'enlever') {
      if (!solidAs) throw new Error('enlever sans solide')
      if (!esquisse) throw new Error('enlever sans esquisse')
      const profondeur = evaluer(operation.profondeur, parametres)
      if (!(profondeur > 0)) throw new Error('profondeur enlever doit être positive')
      const cercle = [...esquisse.cercles].reverse().find((c) => c.diametre)
      if (!cercle?.diametre) throw new Error('enlever sans cercle coté')
      const rayonMm = (evaluer(cercle.diametre, parametres) * 1000) / 2
      const marge = 0.4
      const yCut = yMax - profondeur * 1000
      const dirY = profondeur * 1000 + marge
      const outil = opsExtrude(cercleXzMm(rayonMm, yCut), [0, dirY, 0], String(uid++))
      ops.push(...outil.ops)
      const cut = opsCouper(solidAs, outil.as, String(uid++))
      ops.push(...cut.ops)
      solidAs = cut.solidAs
      esquisse = null
      continue
    }
    if (operation.type === 'fillet') {
      if (!solidAs) throw new Error('fillet sans solide')
      const rayon = evaluer(operation.rayon, parametres) * 1000
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
