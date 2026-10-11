import type { OcctKernelModule } from './chargerKernel.ts'
import { tessellerSolide } from './meshUtils.ts'
import { opsCouper, opsExtrude } from './opsDepuisFonction.ts'
import type { BBox, KernelMesh } from './types.ts'

/**
 * Plaque (wire extrude) + trou (cylindre cut via opsCouper).
 * Dimensions en mètres.
 */
export type PlateWithHoleIntent = {
  width: number
  depth: number
  thickness: number
  holeDiameter: number
}

export type PlateWithHoleResult =
  | { ok: true; mesh: KernelMesh; bbox: BBox; unit: 'mm' }
  | { ok: false; code: string; error: string }

export function rebuildPlateWithHole(
  occt: OcctKernelModule,
  intent: PlateWithHoleIntent,
): PlateWithHoleResult {
  const { width, depth, thickness, holeDiameter } = intent
  if (!(width > 0 && depth > 0 && thickness > 0 && holeDiameter > 0)) {
    return { ok: false, code: 'InvalidPlateHole', error: 'dimensions must be positive' }
  }
  if (holeDiameter >= Math.min(width, depth)) {
    return { ok: false, code: 'InvalidPlateHole', error: 'hole larger than plate' }
  }
  const dx = width * 1000
  const dy = thickness * 1000
  const dz = depth * 1000
  const holeR = (holeDiameter * 1000) / 2
  // Contour plaque en XZ (y=0), extrude +Y — même repère que O2-1.
  const hx = dx / 2
  const hz = dz / 2
  const contour = [-hx, 0, -hz, hx, 0, -hz, hx, 0, hz, -hx, 0, hz, -hx, 0, -hz]
  const plate = opsExtrude(contour, [0, dy, 0], 'plate')
  const cutterH = dy + 4
  const cut = opsCouper(plate.as, 'cutter', 'hole')
  const out = tessellerSolide(
    occt,
    [
      ...plate.ops,
      { op: 'make_cylinder', args: [holeR, cutterH], as: 'cutter' },
      ...cut.ops,
    ],
    cut.solidAs,
  )
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}
