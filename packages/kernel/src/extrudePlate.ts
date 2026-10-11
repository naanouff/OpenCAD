import type { OcctKernelModule } from './chargerKernel.ts'
import { tessellerSolide } from './meshUtils.ts'
import type { BBox, KernelMesh } from './types.ts'

/** Plate intent aligned with fixtures/cadompart/example-extruded-plate.md (metres). */
export type ExtrudePlateIntent = {
  width: number
  depth: number
  thickness: number
}

export type ExtrudePlateResult =
  | { ok: true; mesh: KernelMesh; bbox: BBox; unit: 'mm' }
  | { ok: false; code: string; error: string }

/**
 * Rebuild a rectangular plate via occt-kernel `make_box`.
 * Input metres (cadompart units); OCCT ops use millimetres.
 */
export function rebuildExtrudePlate(
  occt: OcctKernelModule,
  intent: ExtrudePlateIntent,
): ExtrudePlateResult {
  const { width, depth, thickness } = intent
  if (!(width > 0 && depth > 0 && thickness > 0)) {
    return { ok: false, code: 'InvalidPlate', error: 'dimensions must be positive' }
  }
  const dx = width * 1000
  const dy = thickness * 1000
  const dz = depth * 1000
  const out = tessellerSolide(
    occt,
    [{ op: 'make_box', args: [dx, dy, dz], as: 'body' }],
    'body',
  )
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}
