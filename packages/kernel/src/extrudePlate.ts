import { runBatch, type OcctKernelModule } from './chargerKernel.ts'
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

function bboxFromPositions(positions: number[]): BBox {
  let xmin = Infinity
  let xmax = -Infinity
  let ymin = Infinity
  let ymax = -Infinity
  let zmin = Infinity
  let zmax = -Infinity
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!
    const y = positions[i + 1]!
    const z = positions[i + 2]!
    xmin = Math.min(xmin, x)
    xmax = Math.max(xmax, x)
    ymin = Math.min(ymin, y)
    ymax = Math.max(ymax, y)
    zmin = Math.min(zmin, z)
    zmax = Math.max(zmax, z)
  }
  return { xmin, xmax, ymin, ymax, zmin, zmax }
}

function flattenMeshes(meshes: Array<{ positions?: number[]; indices?: number[] }>): KernelMesh {
  const positions: number[] = []
  const indices: number[] = []
  for (const mesh of meshes) {
    const base = positions.length / 3
    positions.push(...(mesh.positions ?? []))
    for (const i of mesh.indices ?? []) indices.push(base + i)
  }
  return {
    triangleCount: indices.length / 3,
    positions,
    indices,
  }
}

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
  const out = runBatch(occt, [
    { op: 'arena_clear' },
    { op: 'make_box', args: [dx, dy, dz], as: 'body' },
    { op: 'tessellate', args: [{ handle: 'body' }, 'normal'], as: 'mesh' },
  ])
  if (!out.ok) {
    return { ok: false, code: 'BatchFailed', error: out.error ?? 'occt batch failed' }
  }
  const payload = out.aliases?.mesh as {
    ok?: boolean
    error?: string
    triangleCount?: number
    meshes?: Array<{ positions?: number[]; indices?: number[] }>
  }
  if (!payload || payload.ok === false) {
    return { ok: false, code: 'TessellateFailed', error: payload?.error ?? 'tessellate failed' }
  }
  const mesh = flattenMeshes(payload.meshes ?? [])
  if (mesh.triangleCount <= 0) {
    return { ok: false, code: 'EmptyMesh', error: 'no triangles' }
  }
  return { ok: true, mesh, bbox: bboxFromPositions(mesh.positions), unit: 'mm' }
}
