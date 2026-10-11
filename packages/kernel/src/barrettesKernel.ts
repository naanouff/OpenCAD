import { evaluer } from './evaluateur.ts'
import { opsCouper, opsExtrude, type Polyline3 } from './opsDepuisFonction.ts'
import type { KernelBatchOp } from './types.ts'

/** Cercle dans un plan YZ (trou d’axe X), centre (x0, y, z) — mm OCCT. */
export function cerclePlanYZ(
  rayon: number,
  x0: number,
  y: number,
  z: number,
  segments = 32,
): Polyline3 {
  const xyz: number[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    xyz.push(x0, y + Math.cos(a) * rayon, z + Math.sin(a) * rayon)
  }
  xyz.push(xyz[0]!, xyz[1]!, xyz[2]!)
  return xyz
}

/**
 * Quatre trous de barrette (placement pédagogique, mêmes params que `decrire`).
 * Extrait éditeur `pipelineOcct.opsBarrettesPedagogiques`.
 * Unités sketch via `scale` (mm → 1, m → 1000) ; `rayon` déjà en mm OCCT.
 */
export function opsBarrettesPedagogiques(
  solidAs: string,
  rayonMm: number,
  parametres: Map<string, string>,
  scale: number,
  uid: () => string,
): { ops: KernelBatchOp[]; solidAs: string } {
  if (!parametres.has('diametre_boite') || !parametres.has('longueur_corne')) {
    return { ops: [], solidAs }
  }
  const ev = (expr: string) => evaluer(expr, parametres) * scale
  const rayonExt = ev('diametre_boite') / 2
  const debord = ev('longueur_corne')
  const bout = rayonExt + debord
  const recul = parametres.has('recul_barrette') ? ev('recul_barrette') : debord / 2
  const zBarrette = bout - recul
  const interieur = parametres.has('entrecorne') ? ev('entrecorne') / 2 : 10 * scale
  const largeurRacine = parametres.has('largeur_racine') ? ev('largeur_racine') : 6 * scale
  const exterieur = interieur + largeurRacine
  let yBarrette = parametres.has('hauteur_carrure') ? ev('hauteur_carrure') / 2 : 4 * scale
  if (parametres.has('plongee_bout') && parametres.has('epaisseur_bout')) {
    yBarrette = ev('plongee_bout') + ev('epaisseur_bout') / 2
  }
  const marge = 0.4
  const longueur = exterieur - interieur + marge * 2
  const dir: readonly [number, number, number] = [longueur, 0, 0]
  const ops: KernelBatchOp[] = []
  let courant = solidAs
  for (const z of [zBarrette, -zBarrette] as const) {
    for (const x0 of [interieur - marge, -exterieur - marge] as const) {
      const feat = opsExtrude(cerclePlanYZ(rayonMm, x0, yBarrette, z), dir, uid())
      ops.push(...feat.ops)
      const cut = opsCouper(courant, feat.as, uid())
      ops.push(...cut.ops)
      courant = cut.solidAs
    }
  }
  return { ops, solidAs: courant }
}
