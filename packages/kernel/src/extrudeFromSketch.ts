import type { OcctKernelModule } from './chargerKernel.ts'
import type { ExtrudePlateResult } from './extrudePlate.ts'
import { tessellerSolide } from './meshUtils.ts'
import { opsExtrude } from './opsDepuisFonction.ts'
import { polylinesDepuisResolue } from './polylinesDepuisResolue.ts'
import {
  etatEsquisse,
  exigerContraint,
  resoudreEsquisse,
  type EsquisseKernel,
} from './sketchSolve.ts'

/**
 * Extrude a constrained rectangle sketch (metres) by `thickness` (metres).
 * Path: GCS → wire polyline → face → extrude (O2 extract, not make_box).
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
  if (!(thickness > 0)) {
    return { ok: false, code: 'InvalidPlate', error: 'thickness must be positive' }
  }
  let polys
  try {
    polys = polylinesDepuisResolue(resolue, { yPlan: 0, echelle: 1000 })
  } catch (e) {
    return {
      ok: false,
      code: 'SketchFailed',
      error: e instanceof Error ? e.message : String(e),
    }
  }
  const dy = thickness * 1000
  const feat = opsExtrude(polys[0]!, [0, dy, 0], '0')
  const out = tessellerSolide(occt, feat.ops, feat.as)
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}

export { etatEsquisse, resoudreEsquisse, exigerContraint }
