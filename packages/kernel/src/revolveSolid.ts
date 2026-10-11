import type { OcctKernelModule } from './chargerKernel.ts'
import { tessellerSolide } from './meshUtils.ts'
import type { BBox, KernelMesh } from './types.ts'

/**
 * Rectangle in XZ extruded in Y via révolution autour de Y
 * (profil à x=radius, hauteur=height) → cylindre plein.
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
  // Profil XY du kernel batch : polyline xyz, révolution autour de Y (comme l’éditeur).
  const profil = [0, 0, 0, r, 0, 0, r, h, 0, 0, h, 0, 0, 0, 0]
  const out = tessellerSolide(
    occt,
    [
      { op: 'make_wire_polyline', args: [profil], as: 'wire' },
      { op: 'make_face_from_wire', args: [{ handle: 'wire' }], as: 'face' },
      { op: 'revolve', args: [{ handle: 'face' }, 0, 0, 0, 0, 1, 0, Math.PI * 2], as: 'body' },
    ],
    'body',
  )
  if (!out.ok) return out
  return { ok: true, mesh: out.mesh, bbox: out.bbox, unit: 'mm' }
}
