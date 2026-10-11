import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import protobuf from 'protobufjs'
import { runBatch, type OcctKernelModule } from './chargerKernel.ts'
import { KERNEL_NAME, KERNEL_PRODUCT_VERSION } from './identity.ts'
import { listerTopo } from './topoIds.ts'
import type { KernelBatchOp } from './types.ts'

const protoPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'cadombrep-proto',
  'cadombrep.proto',
)

let CadombrepFileType: protobuf.Type | null = null

function typeCadombrep(): protobuf.Type {
  if (!CadombrepFileType) {
    const root = protobuf.loadSync(protoPath)
    CadombrepFileType = root.lookupType('cadombrep.v0.CadombrepFile')
  }
  return CadombrepFileType
}

export type CadombrepWriteOptions = {
  name?: string
  sourceCadompartId?: string
  sourceCadompartSha256?: string
  activeConfigurationId?: string
  units?: 'mm' | 'm'
}

export type CadombrepLogical = {
  versionMajor: number
  versionMinor: number
  name: string
  units: number
  upAxis: number
  kernelId: string
  kernelVersion: string
  encoding: number
  solidBlob: Uint8Array
  bodyIds: string[]
  faceIds: string[]
  edgeIds: string[]
}

export type CadombrepWriteResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; code: string; error: string }

/**
 * Build solid from ops, enumerate topo, export OCCT BREP → `.cadombrep` bytes.
 */
export function ecrireCadombrep(
  occt: OcctKernelModule,
  ops: KernelBatchOp[],
  solidAs: string,
  options: CadombrepWriteOptions = {},
): CadombrepWriteResult {
  const topo = listerTopo(occt, ops, solidAs)
  if (!topo.ok) return topo

  const exported = runBatch(occt, [
    { op: 'arena_clear' },
    ...ops,
    { op: 'export_brep', args: [{ handle: solidAs }], as: 'brep' },
  ])
  if (!exported.ok) {
    return { ok: false, code: 'BatchFailed', error: exported.error ?? 'export_brep failed' }
  }
  const blob = exported.aliases?.brep
  if (!(blob instanceof Uint8Array) || blob.byteLength === 0) {
    return { ok: false, code: 'EmptyBrep', error: 'export_brep returned empty blob' }
  }

  const Type = typeCadombrep()
  const message = Type.create({
    versionMajor: 0,
    versionMinor: 0,
    name: options.name ?? '',
    units: options.units === 'm' ? 1 : 2,
    upAxis: 1,
    kernelId: KERNEL_NAME,
    kernelVersion: KERNEL_PRODUCT_VERSION,
    sourceCadompartId: options.sourceCadompartId ?? '',
    sourceCadompartSha256: options.sourceCadompartSha256 ?? '',
    activeConfigurationId: options.activeConfigurationId ?? '',
    bodyIds: [topo.topo.bodyId],
    faceIds: topo.topo.faces.map((f) => f.id),
    edgeIds: topo.topo.edges.map((e) => e.id),
    vertexIds: [],
    encoding: 2, // OCCT_BREP
    solidBlob: blob,
  })
  const err = Type.verify(message)
  if (err) return { ok: false, code: 'EncodeFailed', error: err }
  return { ok: true, bytes: Type.encode(message).finish() }
}

/** Plate helper (metres → mm box). */
export function ecrireCadombrepPlaque(
  occt: OcctKernelModule,
  width: number,
  depth: number,
  thickness: number,
  options: CadombrepWriteOptions = {},
): CadombrepWriteResult {
  const dx = width * 1000
  const dy = thickness * 1000
  const dz = depth * 1000
  return ecrireCadombrep(
    occt,
    [{ op: 'make_box', args: [dx, dy, dz], as: 'body' }],
    'body',
    { name: options.name ?? 'plate', ...options },
  )
}

export function lireCadombrep(octets: Uint8Array): CadombrepLogical {
  const Type = typeCadombrep()
  const decoded = Type.decode(octets) as protobuf.Message & {
    versionMajor?: number
    versionMinor?: number
    name?: string
    units?: number
    upAxis?: number
    kernelId?: string
    kernelVersion?: string
    encoding?: number
    solidBlob?: Uint8Array
    bodyIds?: string[]
    faceIds?: string[]
    edgeIds?: string[]
  }
  const err = Type.verify(decoded)
  if (err) throw new Error(`cadombrep: ${err}`)
  if ((decoded.encoding ?? 0) === 1) {
    throw new Error('cadombrep: OPENCAD_NATIVE not defined')
  }
  if ((decoded.encoding ?? 0) !== 0 && !(decoded.solidBlob?.byteLength)) {
    throw new Error('cadombrep: empty solid_blob')
  }
  const faceIds = [...(decoded.faceIds ?? [])]
  const edgeIds = [...(decoded.edgeIds ?? [])]
  if (new Set(faceIds).size !== faceIds.length || new Set(edgeIds).size !== edgeIds.length) {
    throw new Error('cadombrep: duplicate topology ids')
  }
  return {
    versionMajor: decoded.versionMajor ?? 0,
    versionMinor: decoded.versionMinor ?? 0,
    name: decoded.name ?? '',
    units: decoded.units ?? 0,
    upAxis: decoded.upAxis ?? 0,
    kernelId: decoded.kernelId ?? '',
    kernelVersion: decoded.kernelVersion ?? '',
    encoding: decoded.encoding ?? 0,
    solidBlob: decoded.solidBlob ?? new Uint8Array(),
    bodyIds: [...(decoded.bodyIds ?? [])],
    faceIds,
    edgeIds,
  }
}

/** Re-import BREP blob to prove bootstrap round-trip. */
export function importerBrep(occt: OcctKernelModule, blob: Uint8Array): boolean {
  const out = runBatch(occt, [
    { op: 'arena_clear' },
    { op: 'import_brep', args: [blob], as: 'body' },
    { op: 'tessellate', args: [{ handle: 'body' }, 'normal'], as: 'mesh' },
  ])
  if (!out.ok) return false
  const mesh = out.aliases?.mesh as { ok?: boolean; triangleCount?: number }
  return mesh?.ok !== false && (mesh?.triangleCount ?? 0) > 0
}
