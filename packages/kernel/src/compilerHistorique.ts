import { evaluer } from './evaluateur.ts'
import {
  accrocherSolide,
  opsExtrude,
  opsFillet,
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
 * Unités sketch / profondeur : mètres (même convention K3-5).
 */
export type OperationKernel =
  | { type: 'param'; nom: string; expression: string }
  | { type: 'ouvrir'; support?: string }
  | { type: 'rectangle'; id?: string }
  | { type: 'cote'; cible: 'longueur' | 'largeur'; expression: string }
  | { type: 'extrude'; profondeur: string }
  | { type: 'fillet'; rayon: string; indices?: number[] | null }

export type CompilationKernel = {
  ops: KernelBatchOp[]
  solidAs: string | null
  parametres: Map<string, string>
}

type EsquisseEnCours = {
  support: string
  rectangles: RectangleEsquisse[]
}

/**
 * Compile un préfixe d’historique (param / esquisse / extrude / fillet)
 * en batch occt-kernel. Hors scope : révolution, enlever, carrure, pas.
 */
export function compilerHistorique(historique: OperationKernel[]): CompilationKernel {
  const parametres = new Map<string, string>()
  const ops: KernelBatchOp[] = []
  let solidAs: string | null = null
  let esquisse: EsquisseEnCours | null = null
  let uid = 0

  for (const operation of historique) {
    if (operation.type === 'param') {
      parametres.set(operation.nom, operation.expression)
      continue
    }
    if (operation.type === 'ouvrir') {
      esquisse = { support: operation.support ?? 'plan.dessus', rectangles: [] }
      continue
    }
    if (operation.type === 'rectangle') {
      if (!esquisse) throw new Error('rectangle hors esquisse')
      esquisse.rectangles.push({ id: operation.id ?? `r${uid++}` })
      continue
    }
    if (operation.type === 'cote') {
      const dernier = esquisse?.rectangles.at(-1)
      if (!dernier) throw new Error('cote sans rectangle')
      if (operation.cible === 'longueur') dernier.longueur = operation.expression
      else dernier.largeur = operation.expression
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
