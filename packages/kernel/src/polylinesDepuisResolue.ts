import type { EsquisseResolue } from './sketchSolve.ts'
import type { Polyline3 } from './opsDepuisFonction.ts'

/**
 * UV sketch → world XYZ (mm): U→X, V→Z, Y = yPlan.
 * Aligné éditeur `plan.dessus` / face.* (`esquissePolylines`).
 * `echelle` : metres sketch → mm (1000) or 1 if already mm.
 */
export function polylinesDepuisResolue(
  resolue: EsquisseResolue,
  options: { yPlan?: number; echelle?: number } = {},
): Polyline3[] {
  if (resolue.statut !== 'contraint') {
    throw new Error(resolue.statut === 'surcontraint' ? 'esquisse surcontrainte' : 'esquisse sous-contrainte')
  }
  const yPlan = options.yPlan ?? 0
  const echelle = options.echelle ?? 1000
  const pts = new Map(resolue.points.map((p) => [p.id, p]))
  const sortie: Polyline3[] = []
  for (const poly of resolue.polylines) {
    const xyz: number[] = []
    for (const id of poly.points) {
      const p = pts.get(id)
      if (!p) throw new Error(`point inconnu ${id}`)
      xyz.push(p.u * echelle, yPlan, p.v * echelle)
    }
    sortie.push(fermer(xyz))
  }
  return sortie
}

function fermer(xyz: Polyline3): Polyline3 {
  if (xyz.length < 9) return xyz
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
