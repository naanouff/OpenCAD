import protobuf from 'protobufjs'
import { CADOMESH_PROTO_SOURCE } from './cadomeshProtoSource.ts'
import type { KernelMesh } from './types.ts'

let CadomeshFileType: protobuf.Type | null = null

function typeCadomesh(): protobuf.Type {
  if (!CadomeshFileType) {
    const { root } = protobuf.parse(CADOMESH_PROTO_SOURCE, { keepCase: false })
    CadomeshFileType = root.lookupType('cadomesh.v0.CadomeshFile')
  }
  return CadomeshFileType
}

export type CadomeshWriteOptions = {
  name?: string
  /** Default millimetres (kernel tessellation). */
  units?: 'mm' | 'm'
}

export type CadomeshLogical = {
  versionMajor: number
  versionMinor: number
  name: string
  units: number
  upAxis: number
  topology: number
  positions: number[]
  normals: number[]
  indices: number[]
}

/** Encode KernelMesh → `.cadomesh` bytes (CadomeshFile v0). */
export function ecrireCadomesh(mesh: KernelMesh, options: CadomeshWriteOptions = {}): Uint8Array {
  if (mesh.positions.length === 0 || mesh.positions.length % 3 !== 0) {
    throw new Error('cadomesh: positions invalid')
  }
  if (mesh.indices.length === 0 || mesh.indices.length % 3 !== 0) {
    throw new Error('cadomesh: indices invalid')
  }
  const vertexCount = mesh.positions.length / 3
  for (const i of mesh.indices) {
    if (i < 0 || i >= vertexCount) throw new Error('cadomesh: index out of range')
  }
  const normals =
    mesh.normales && mesh.normales.length === mesh.positions.length
      ? mesh.normales
      : []
  const Type = typeCadomesh()
  const message = Type.create({
    versionMajor: 0,
    versionMinor: 0,
    name: options.name ?? '',
    units: options.units === 'm' ? 1 : 2, // METRES | MILLIMETRES
    upAxis: 1, // Y
    topology: 1, // TRIANGLES
    positions: mesh.positions,
    normals,
    indices: mesh.indices,
  })
  const err = Type.verify(message)
  if (err) throw new Error(`cadomesh: ${err}`)
  return Type.encode(message).finish()
}

/** Decode `.cadomesh` bytes (round-trip / tests). */
export function lireCadomesh(octets: Uint8Array): CadomeshLogical {
  const Type = typeCadomesh()
  const decoded = Type.decode(octets) as protobuf.Message & {
    versionMajor?: number
    versionMinor?: number
    name?: string
    units?: number
    upAxis?: number
    topology?: number
    positions?: number[]
    normals?: number[]
    indices?: number[]
  }
  const err = Type.verify(decoded)
  if (err) throw new Error(`cadomesh: ${err}`)
  if ((decoded.topology ?? 0) !== 1) throw new Error('cadomesh: topology must be TRIANGLES')
  const positions = [...(decoded.positions ?? [])]
  if (positions.length === 0 || positions.length % 3 !== 0) {
    throw new Error('cadomesh: positions invalid')
  }
  return {
    versionMajor: decoded.versionMajor ?? 0,
    versionMinor: decoded.versionMinor ?? 0,
    name: decoded.name ?? '',
    units: decoded.units ?? 0,
    upAxis: decoded.upAxis ?? 0,
    topology: decoded.topology ?? 0,
    positions,
    normals: [...(decoded.normals ?? [])],
    indices: [...(decoded.indices ?? [])],
  }
}
