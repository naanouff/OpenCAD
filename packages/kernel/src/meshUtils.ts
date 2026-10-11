import { runBatch, type OcctKernelModule } from './chargerKernel.ts'
import type { BBox, KernelBatchOp, KernelMesh } from './types.ts'

export function bboxFromPositions(positions: number[]): BBox {
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

export function flattenMeshes(
  meshes: Array<{ positions?: number[]; normals?: number[]; indices?: number[] }>,
): KernelMesh {
  const positions: number[] = []
  const normales: number[] = []
  const indices: number[] = []
  for (const mesh of meshes) {
    const base = positions.length / 3
    const pos = mesh.positions ?? []
    const nor = mesh.normals ?? []
    positions.push(...pos)
    if (nor.length === pos.length) normales.push(...nor)
    else {
      for (let i = 0; i < pos.length; i += 3) normales.push(0, 1, 0)
    }
    for (const i of mesh.indices ?? []) indices.push(base + i)
  }
  return {
    triangleCount: indices.length / 3,
    positions,
    indices,
    normales,
  }
}

export type TessellateResult =
  | { ok: true; mesh: KernelMesh; bbox: BBox }
  | { ok: false; code: string; error: string }

/** Run batch ops then tessellate the solid alias. */
export function tessellerSolide(
  occt: OcctKernelModule,
  ops: KernelBatchOp[],
  solidAs: string,
): TessellateResult {
  const out = runBatch(occt, [
    { op: 'arena_clear' },
    ...ops,
    { op: 'tessellate', args: [{ handle: solidAs }, 'normal'], as: 'mesh' },
  ])
  if (!out.ok) {
    return { ok: false, code: 'BatchFailed', error: out.error ?? 'occt batch failed' }
  }
  const payload = out.aliases?.mesh as {
    ok?: boolean
    error?: string
    meshes?: Array<{ positions?: number[]; normals?: number[]; indices?: number[] }>
  }
  if (!payload || payload.ok === false) {
    return { ok: false, code: 'TessellateFailed', error: payload?.error ?? 'tessellate failed' }
  }
  const mesh = flattenMeshes(payload.meshes ?? [])
  if (mesh.triangleCount <= 0) {
    return { ok: false, code: 'EmptyMesh', error: 'no triangles' }
  }
  return { ok: true, mesh, bbox: bboxFromPositions(mesh.positions) }
}

/** True if any vertex lies near (x,y,z) within eps (mm). */
export function aSommetPresDe(mesh: KernelMesh, x: number, y: number, z: number, eps: number): boolean {
  for (let i = 0; i < mesh.positions.length; i += 3) {
    if (
      Math.hypot(mesh.positions[i]! - x, mesh.positions[i + 1]! - y, mesh.positions[i + 2]! - z) <= eps
    ) {
      return true
    }
  }
  return false
}
