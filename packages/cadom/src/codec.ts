import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import protobuf from 'protobufjs'
import {
  CADOM_VERSION_MAJOR,
  CADOM_VERSION_MINOR,
  mat4Copy,
  type AssetKind,
  type AssetRole,
  type CadomLogical,
  type LengthUnit,
  type UpAxis,
} from './types.ts'

const protoPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'cadom-proto',
  'cadom.proto',
)

let CadomFileType: protobuf.Type | null = null

function typeCadom(): protobuf.Type {
  if (!CadomFileType) {
    const root = protobuf.loadSync(protoPath)
    CadomFileType = root.lookupType('cadom.v0_1.CadomFile')
  }
  return CadomFileType
}

const UNIT_TO_PROTO: Record<LengthUnit, number> = {
  unspecified: 0,
  m: 1,
  mm: 2,
  in: 3,
}
const PROTO_TO_UNIT: Record<number, LengthUnit> = {
  0: 'unspecified',
  1: 'm',
  2: 'mm',
  3: 'in',
}

const AXIS_TO_PROTO: Record<UpAxis, number> = {
  unspecified: 0,
  y: 1,
  z: 2,
}
const PROTO_TO_AXIS: Record<number, UpAxis> = {
  0: 'unspecified',
  1: 'y',
  2: 'z',
}

const KIND_TO_PROTO: Record<AssetKind, number> = {
  unspecified: 0,
  step: 1,
  gltf: 2,
  glb: 3,
  other: 4,
  cadomesh: 5,
  cadompart: 6,
  cadomat: 7,
  cadometa: 8,
  cadombrep: 9,
}
const PROTO_TO_KIND: Record<number, AssetKind> = {
  0: 'unspecified',
  1: 'step',
  2: 'gltf',
  3: 'glb',
  4: 'other',
  5: 'cadomesh',
  6: 'cadompart',
  7: 'cadomat',
  8: 'cadometa',
  9: 'cadombrep',
}

const ROLE_TO_PROTO: Record<AssetRole, number> = {
  unspecified: 0,
  mesh: 1,
  parametric: 2,
  material: 3,
  metadata: 4,
  exact: 5,
}
const PROTO_TO_ROLE: Record<number, AssetRole> = {
  0: 'unspecified',
  1: 'mesh',
  2: 'parametric',
  3: 'material',
  4: 'metadata',
  5: 'exact',
}

function bytesOf(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (Buffer.isBuffer(value)) return new Uint8Array(value)
  if (value && typeof value === 'object' && 'buffer' in (value as object)) {
    const u = value as { buffer: ArrayBuffer; byteOffset: number; byteLength: number }
    return new Uint8Array(u.buffer, u.byteOffset, u.byteLength)
  }
  return new Uint8Array()
}

/** Encode logical document → `.cadom` bytes. */
export function encode(doc: CadomLogical): Uint8Array {
  const Type = typeCadom()
  const message = Type.create({
    versionMajor: doc.versionMajor,
    versionMinor: doc.versionMinor,
    units: UNIT_TO_PROTO[doc.units] ?? 0,
    upAxis: AXIS_TO_PROTO[doc.upAxis] ?? 0,
    rootIds: doc.rootIds,
    nodes: doc.nodes.map((n) => ({
      id: n.id,
      parentId: n.parentId,
      name: n.name,
      localTransform: Array.from(n.localTransform),
      assetId: n.assetId ?? '',
      visible: n.visible,
      semanticType: n.semanticType ?? '',
      assetBindings: n.assetBindings.map((b) => ({
        role: ROLE_TO_PROTO[b.role] ?? 0,
        assetId: b.assetId,
      })),
    })),
    assets: doc.assets.map((a) => ({
      id: a.id,
      uri: a.uri,
      kind: KIND_TO_PROTO[a.kind] ?? 0,
      mime: a.mime ?? '',
      contentSha256: a.contentSha256 ?? '',
      byteLength: a.byteLength,
    })),
    overrides: doc.overrides.map((o) => ({
      nodeId: o.nodeId,
      layer: o.layer,
      visible: o.visible,
      materialRef: o.materialRef,
      localTransform: o.localTransform ? Array.from(o.localTransform) : [],
    })),
    extensions: doc.extensions.map((e) => ({
      vendor: e.vendor,
      type: e.type,
      payload: e.payload,
    })),
    defaultActiveLayers: doc.defaultActiveLayers,
  })
  const err = Type.verify(message)
  if (err) throw new Error(`cadom encode: ${err}`)
  return Type.encode(message).finish()
}

/** Decode `.cadom` bytes → logical document. */
export function decode(octets: Uint8Array): CadomLogical {
  const Type = typeCadom()
  const raw = Type.decode(octets) as protobuf.Message & Record<string, unknown>
  const obj = Type.toObject(raw, {
    longs: Number,
    enums: Number,
    bytes: Uint8Array,
    defaults: true,
  }) as Record<string, unknown>

  const nodesRaw = (obj.nodes as Array<Record<string, unknown>>) ?? []
  const assetsRaw = (obj.assets as Array<Record<string, unknown>>) ?? []
  const overridesRaw = (obj.overrides as Array<Record<string, unknown>>) ?? []
  const extensionsRaw = (obj.extensions as Array<Record<string, unknown>>) ?? []

  return {
    versionMajor: Number(obj.versionMajor ?? CADOM_VERSION_MAJOR),
    versionMinor: Number(obj.versionMinor ?? CADOM_VERSION_MINOR),
    units: PROTO_TO_UNIT[Number(obj.units ?? 0)] ?? 'unspecified',
    upAxis: PROTO_TO_AXIS[Number(obj.upAxis ?? 0)] ?? 'unspecified',
    rootIds: (obj.rootIds as string[]) ?? [],
    nodes: nodesRaw.map((n) => ({
      id: String(n.id ?? ''),
      parentId: String(n.parentId ?? ''),
      name: String(n.name ?? ''),
      localTransform: mat4Copy(n.localTransform as number[]),
      assetId: n.assetId ? String(n.assetId) : undefined,
      visible: typeof n.visible === 'boolean' ? n.visible : undefined,
      semanticType: n.semanticType ? String(n.semanticType) : undefined,
      assetBindings: ((n.assetBindings as Array<Record<string, unknown>>) ?? []).map((b) => ({
        role: PROTO_TO_ROLE[Number(b.role ?? 0)] ?? 'unspecified',
        assetId: String(b.assetId ?? ''),
      })),
    })),
    assets: assetsRaw.map((a) => ({
      id: String(a.id ?? ''),
      uri: String(a.uri ?? ''),
      kind: PROTO_TO_KIND[Number(a.kind ?? 0)] ?? 'unspecified',
      mime: a.mime ? String(a.mime) : undefined,
      contentSha256: a.contentSha256 ? String(a.contentSha256) : undefined,
      byteLength: a.byteLength !== undefined && a.byteLength !== null ? Number(a.byteLength) : undefined,
    })),
    overrides: overridesRaw.map((o) => ({
      nodeId: String(o.nodeId ?? ''),
      layer: String(o.layer ?? ''),
      visible: typeof o.visible === 'boolean' ? o.visible : undefined,
      materialRef: o.materialRef ? String(o.materialRef) : undefined,
      localTransform:
        Array.isArray(o.localTransform) && (o.localTransform as number[]).length === 16
          ? mat4Copy(o.localTransform as number[])
          : undefined,
    })),
    extensions: extensionsRaw.map((e) => ({
      vendor: String(e.vendor ?? ''),
      type: String(e.type ?? ''),
      payload: bytesOf(e.payload),
    })),
    defaultActiveLayers: (obj.defaultActiveLayers as string[]) ?? [],
  }
}
