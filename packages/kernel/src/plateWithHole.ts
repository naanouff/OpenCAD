import type { OcctKernelModule } from './chargerKernel.ts'
import { tessellerSolide } from './meshUtils.ts'
import type { BBox, KernelMesh } from './types.ts'

/**
 * Plaque + trou traversant (boolean cut), aligné example-plate-hole-fillet.md
 * (sans fillet). Dimensions en mètres.
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
  // Cylindre outil plus long que l’épaisseur ; cut au centre de la plaque.
  const cutterH = dy + 4
  const out = tessellerSolide(
    occt,
    [
      { op: 'make_box', args: [dx, dy, dz], as: 'plate' },
      { op: 'make_cylinder', args: [holeR, cutterH], as: 'cutter' },
      { op: 'boolean_cut', args: [{ handle: 'plate' }, { handle: 'cutter' }], as: 'body' },
    ],
    'body',
  )
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}
