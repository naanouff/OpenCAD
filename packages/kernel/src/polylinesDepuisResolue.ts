import { datumParId, gcsVersMonde } from './datumsKernel.ts'
import type { EsquisseResolue } from './sketchSolve.ts'
import type { Polyline3 } from './opsDepuisFonction.ts'

/**
 * UV sketch → world XYZ (mm).
 * Sans datum (`face.*`) : U→X, V→Z, Y = yPlan.
 * Avec `support` datum : `gcsVersMonde` (O2-11 plan.3h).
 * Cercle (polyline 1 point `.p`) → densifié (O2-6).
 * `echelle` : metres sketch → mm (1000) or 1 if already mm.
 */
export function polylinesDepuisResolue(
  resolue: EsquisseResolue,
  options: {
    yPlan?: number
    echelle?: number
    segmentsCercle?: number
    support?: string
  } = {},
): Polyline3[] {
  if (resolue.statut !== 'contraint') {
    throw new Error(resolue.statut === 'surcontraint' ? 'esquisse surcontrainte' : 'esquisse sous-contrainte')
  }
  const yPlan = options.yPlan ?? 0
  const echelle = options.echelle ?? 1000
  const segmentsCercle = options.segmentsCercle ?? 48
  const datum = options.support ? datumParId(options.support) : undefined
  const pts = new Map(resolue.points.map((p) => [p.id, p]))
  const sortie: Polyline3[] = []
  for (const poly of resolue.polylines) {
    if (poly.points.length === 1) {
      const bord = pts.get(poly.points[0]!)
      const centreId = poly.points[0]!.replace(/\.p$/, '.o')
      const centre = pts.get(centreId)
      if (!bord || !centre) throw new Error(`cercle incomplet ${poly.points[0]}`)
      const r = Math.hypot(bord.u - centre.u, bord.v - centre.v) * echelle
      const cu = centre.u * echelle
      const cv = centre.v * echelle
      sortie.push(cercleDensifie(cu, cv, r, yPlan, segmentsCercle, datum))
      continue
    }
    const xyz: number[] = []
    for (const id of poly.points) {
      const p = pts.get(id)
      if (!p) throw new Error(`point inconnu ${id}`)
      const u = p.u * echelle
      const v = p.v * echelle
      if (datum) xyz.push(...gcsVersMonde(datum, u, v, yPlan))
      else xyz.push(u, yPlan, v)
    }
    sortie.push(fermer(xyz))
  }
  return sortie
}

function cercleDensifie(
  cu: number,
  cv: number,
  rayon: number,
  altitude: number,
  segments: number,
  datum: ReturnType<typeof datumParId>,
): Polyline3 {
  const xyz: number[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const u = cu + Math.cos(a) * rayon
    const v = cv + Math.sin(a) * rayon
    if (datum) xyz.push(...gcsVersMonde(datum, u, v, altitude))
    else xyz.push(u, altitude, v)
  }
  return fermer(xyz)
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
