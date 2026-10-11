/**
 * @opencad/cadom — CADOM graph SDK (O4-1).
 * decode / encode / CadomDocument / applyOverrides.
 */

export { decode, encode } from './codec.ts'
export { CadomDocument } from './document.ts'
export { applyOverrides, type ResolvedCadomNode } from './overrides.ts'
export {
  CADOM_VERSION_MAJOR,
  CADOM_VERSION_MINOR,
  mat4Identity,
  mat4Copy,
  mat4Multiply,
  type AssetKind,
  type AssetRole,
  type CadomAsset,
  type CadomExtension,
  type CadomLogical,
  type CadomNode,
  type CadomOverride,
  type LengthUnit,
  type NodeAssetBinding,
  type UpAxis,
} from './types.ts'
