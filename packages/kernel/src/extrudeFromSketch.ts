import type { OcctKernelModule } from './chargerKernel.ts'
import { rebuildExtrudePlate, type ExtrudePlateResult } from './extrudePlate.ts'
import {
  etatEsquisse,
  exigerContraint,
  resoudreEsquisse,
  type EsquisseKernel,
} from './sketchSolve.ts'

/**
 * Extrude a constrained rectangle sketch (metres) by `thickness` (metres).
 * Fails explicitly if sous/sur-contraint (K3-5).
 */
export function rebuildExtrudeFromRectangle(
  occt: OcctKernelModule,
  esquisse: EsquisseKernel,
  thickness: number,
  parametres: Map<string, string> = new Map(),
): ExtrudePlateResult {
  const resolue = resoudreEsquisse(esquisse, parametres)
  try {
    exigerContraint(resolue)
  } catch (e) {
    return {
      ok: false,
      code: resolue.statut === 'surcontraint' ? 'OverConstrained' : 'UnderConstrained',
      error: e instanceof Error ? e.message : String(e),
    }
  }
  const rect = esquisse.rectangles[0]
  if (!rect?.longueur || !rect.largeur) {
    return { ok: false, code: 'UnderConstrained', error: 'esquisse non contrainte' }
  }
  // Solved half-extents → full width/depth in sketch units (metres for plate fixture).
  const pts = Object.fromEntries(resolue.points.map((p) => [p.id, p]))
  const a = pts[`${rect.id}.a`]!
  const b = pts[`${rect.id}.b`]!
  const d = pts[`${rect.id}.d`]!
  const width = Math.hypot(b.u - a.u, b.v - a.v)
  const depth = Math.hypot(d.u - a.u, d.v - a.v)
  return rebuildExtrudePlate(occt, { width, depth, thickness })
}

export { etatEsquisse, resoudreEsquisse, exigerContraint }
