import { runBatch, type OcctKernelModule } from './chargerKernel.ts'
import type { KernelBatchOp } from './types.ts'

/** Shape-local entity id for a rebuild snapshot (K3-6). */
export function idFace(index: number): string {
  return `face:${index}`
}

export function idEdge(index: number): string {
  return `edge:${index}`
}

export function idBody(index = 0): string {
  return `body:${index}`
}

export type FaceTopo = {
  id: string
  /** Shape-local 0-based index from occt-kernel. */
  index: number
  area: number
  midPoint: [number, number, number]
}

export type EdgeTopo = {
  id: string
  index: number
  length: number
  midPoint: [number, number, number]
}

export type TopoSnapshot = {
  bodyId: string
  faces: FaceTopo[]
  edges: EdgeTopo[]
}

export type TopoResult =
  | { ok: true; topo: TopoSnapshot }
  | { ok: false; code: string; error: string }

type ListFacesPayload = {
  ok?: boolean
  faces?: Array<{ id: number; area: number; midPoint: [number, number, number] }>
}

type ListEdgesPayload = {
  ok?: boolean
  edges?: Array<{ id: number; length: number; midPoint: [number, number, number] }>
}

/**
 * Enumerate faces/edges after building `ops` ending in `solidAs`.
 * Ids are stable for this snapshot only; re-list after any topology-changing op.
 */
export function listerTopo(
  occt: OcctKernelModule,
  ops: KernelBatchOp[],
  solidAs: string,
  bodyIndex = 0,
): TopoResult {
  const out = runBatch(occt, [
    { op: 'arena_clear' },
    ...ops,
    { op: 'list_faces', args: [{ handle: solidAs }], as: 'faces' },
    { op: 'list_edges', args: [{ handle: solidAs }], as: 'edges' },
  ])
  if (!out.ok) {
    return { ok: false, code: 'BatchFailed', error: out.error ?? 'occt batch failed' }
  }
  const facesPayload = out.aliases?.faces as ListFacesPayload | undefined
  const edgesPayload = out.aliases?.edges as ListEdgesPayload | undefined
  if (facesPayload?.ok === false || edgesPayload?.ok === false) {
    return { ok: false, code: 'ListFailed', error: 'list_faces/list_edges failed' }
  }
  const faces = (facesPayload?.faces ?? []).map((f) => ({
    id: idFace(f.id),
    index: f.id,
    area: f.area,
    midPoint: f.midPoint,
  }))
  const edges = (edgesPayload?.edges ?? []).map((e) => ({
    id: idEdge(e.id),
    index: e.id,
    length: e.length,
    midPoint: e.midPoint,
  }))
  const faceIds = new Set(faces.map((f) => f.id))
  const edgeIds = new Set(edges.map((e) => e.id))
  if (faceIds.size !== faces.length || edgeIds.size !== edges.length) {
    return { ok: false, code: 'DuplicateIds', error: 'duplicate topology ids' }
  }
  return {
    ok: true,
    topo: {
      bodyId: idBody(bodyIndex),
      faces,
      edges,
    },
  }
}

/** Topology of a rectangular plate (metres → mm box), for goldens / cadombrep lists. */
export function listerTopoPlaque(
  occt: OcctKernelModule,
  width: number,
  depth: number,
  thickness: number,
): TopoResult {
  const dx = width * 1000
  const dy = thickness * 1000
  const dz = depth * 1000
  return listerTopo(occt, [{ op: 'make_box', args: [dx, dy, dz], as: 'body' }], 'body')
}
