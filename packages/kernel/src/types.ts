/** Minimal batch op typing (mirrors occt-wasm). */
export type KernelBatchOp = {
  op: string
  args?: unknown[]
  as?: string
}

export type KernelMesh = {
  triangleCount: number
  positions: number[]
  indices: number[]
}

export type BBox = {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  zmin: number
  zmax: number
}
