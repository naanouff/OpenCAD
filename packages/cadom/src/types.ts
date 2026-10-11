/** Logical CADOM document (SDK view). Spec v0.3.3 → version_minor = 6. */

export const CADOM_VERSION_MAJOR = 0
export const CADOM_VERSION_MINOR = 6

export type LengthUnit = 'm' | 'mm' | 'in' | 'unspecified'
export type UpAxis = 'y' | 'z' | 'unspecified'

export type AssetKind =
  | 'unspecified'
  | 'step'
  | 'gltf'
  | 'glb'
  | 'other'
  | 'cadomesh'
  | 'cadompart'
  | 'cadomat'
  | 'cadometa'
  | 'cadombrep'

export type AssetRole = 'unspecified' | 'mesh' | 'parametric' | 'material' | 'metadata' | 'exact'

export type NodeAssetBinding = {
  role: AssetRole
  assetId: string
}

export type CadomNode = {
  id: string
  parentId: string
  name: string
  /** Column-major mat4 (16 floats). */
  localTransform: Float32Array
  /** Deprecated MESH shortcut (proto `asset_id`). */
  assetId?: string
  visible?: boolean
  semanticType?: string
  assetBindings: NodeAssetBinding[]
}

export type CadomAsset = {
  id: string
  uri: string
  kind: AssetKind
  mime?: string
  contentSha256?: string
  byteLength?: number
}

export type CadomOverride = {
  nodeId: string
  layer: string
  visible?: boolean
  materialRef?: string
  localTransform?: Float32Array
}

export type CadomExtension = {
  vendor: string
  type: string
  payload: Uint8Array
}

export type CadomLogical = {
  versionMajor: number
  versionMinor: number
  units: LengthUnit
  upAxis: UpAxis
  rootIds: string[]
  nodes: CadomNode[]
  assets: CadomAsset[]
  overrides: CadomOverride[]
  extensions: CadomExtension[]
  defaultActiveLayers: string[]
}

/** Identity mat4 column-major. */
export function mat4Identity(): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}

export function mat4Copy(src: ArrayLike<number> | undefined | null): Float32Array {
  if (!src || src.length !== 16) return mat4Identity()
  return Float32Array.from(src)
}

/** Column-major: out = a * b (apply b then a). */
export function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16)
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row]! * b[col * 4 + 0]! +
        a[1 * 4 + row]! * b[col * 4 + 1]! +
        a[2 * 4 + row]! * b[col * 4 + 2]! +
        a[3 * 4 + row]! * b[col * 4 + 3]!
    }
  }
  return out
}
