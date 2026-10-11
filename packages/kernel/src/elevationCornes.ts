import { evaluer } from './evaluateur.ts'
import { opsCouper, opsExtrude, type Polyline3 } from './opsDepuisFonction.ts'
import type { KernelBatchOp } from './types.ts'

/** Rectangle XZ à altitude `y`, enroulement pour extrusion +Y. */
function rectangleXz(
  a0: number,
  a1: number,
  u0: number,
  u1: number,
  y: number,
  sx: number,
  sz: number,
): Polyline3 {
  let pts: [number, number, number][] = [
    [sx * a0, y, sz * u0],
    [sx * a1, y, sz * u0],
    [sx * a1, y, sz * u1],
    [sx * a0, y, sz * u1],
  ]
  let aire = 0
  for (let i = 0; i < 4; i++) {
    const p = pts[i]!
    const q = pts[(i + 1) % 4]!
    aire += p[0] * q[2] - q[0] * p[2]
  }
  if (aire < 0) pts = pts.reverse()
  const xyz: number[] = []
  for (const p of pts) xyz.push(p[0], p[1], p[2])
  xyz.push(pts[0]![0], pts[0]![1], pts[0]![2])
  return xyz
}

/**
 * Découpe le bout des cornes (plongee / épaisseur) après l’extrusion prismatique.
 * Extrait éditeur `pipelineOcct.opsElevationCornes`. Unités sketch via `scale`.
 */
export function opsElevationCornes(
  solidAs: string,
  parametres: Map<string, string>,
  scale: number,
  uid: () => string,
): { ops: KernelBatchOp[]; solidAs: string } {
  if (!parametres.has('epaisseur_bout') || !parametres.has('plongee_bout')) {
    return { ops: [], solidAs }
  }
  const ev = (expr: string) => evaluer(expr, parametres) * scale
  const H = ev('hauteur_carrure')
  const plongee = ev('plongee_bout')
  const epaisseur = ev('epaisseur_bout')
  if (!(epaisseur > 0) || !(H > plongee + epaisseur)) return { ops: [], solidAs }
  const rayonPeau = ev('diametre_boite') / 2
  const a0 = ev('entrecorne') / 2
  const debord = parametres.has('longueur_corne') ? ev('longueur_corne') : 4.2 * scale
  const largeurRacine = parametres.has('largeur_racine') ? ev('largeur_racine') : 6 * scale
  const yTipBas = plongee
  const yTipHaut = plongee + epaisseur
  const a1 = a0 + largeurRacine + 1
  const u0 = rayonPeau - 0.2
  const u1 = rayonPeau + debord + 1
  const ops: KernelBatchOp[] = []
  let courant = solidAs
  for (const sx of [1, -1] as const) {
    for (const sz of [1, -1] as const) {
      const haut = opsExtrude(
        rectangleXz(a0 - 0.05, a1, u0, u1, yTipHaut, sx, sz),
        [0, H - yTipHaut + 1, 0],
        uid(),
      )
      ops.push(...haut.ops)
      const cutH = opsCouper(courant, haut.as, uid())
      ops.push(...cutH.ops)
      courant = cutH.solidAs
      if (yTipBas > 1e-6) {
        const bas = opsExtrude(
          rectangleXz(a0 - 0.05, a1, u0, u1, 0, sx, sz),
          [0, yTipBas, 0],
          uid(),
        )
        ops.push(...bas.ops)
        const cutB = opsCouper(courant, bas.as, uid())
        ops.push(...cutB.ops)
        courant = cutB.solidAs
      }
    }
  }
  return { ops, solidAs: courant }
}
