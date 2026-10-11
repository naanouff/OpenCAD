import type { OcctKernelModule } from './chargerKernel.ts'
import { tessellerSolide } from './meshUtils.ts'
import { opsRevolution } from './opsDepuisFonction.ts'
import type { BBox, KernelMesh } from './types.ts'

/**
 * Rectangle in XY → révolution autour de Y → cylindre plein.
 * Dimensions en mètres.
 */
export type RevolveCylinderIntent = {
  radius: number
  height: number
}

export type RevolveResult =
  | { ok: true; mesh: KernelMesh; bbox: BBox; unit: 'mm' }
  | { ok: false; code: string; error: string }

export function rebuildRevolveCylinder(
  occt: OcctKernelModule,
  intent: RevolveCylinderIntent,
): RevolveResult {
  const { radius, height } = intent
  if (!(radius > 0 && height > 0)) {
    return { ok: false, code: 'InvalidRevolve', error: 'radius and height must be positive' }
  }
  const r = radius * 1000
  const h = height * 1000
  const profil = [0, 0, 0, r, 0, 0, r, h, 0, 0, h, 0, 0, 0, 0]
  const feat = opsRevolution(profil, '0')
  const out = tessellerSolide(occt, feat.ops, feat.as)
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}
