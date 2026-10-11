/**
 * @opencad/cadom — CADOM graph SDK (O4).
 * decode / encode / CadomDocument / applyOverrides / fixtures / layers /
 * resolveForAdapter / planLateLoad / lintWriterTruth.
 */

export { decode, encode } from './codec.ts'
export { CadomDocument } from './document.ts'
export { applyOverrides, type ResolvedCadomNode } from './overrides.ts'
export {
  resolveForAdapter,
  planLateLoad,
  type CadomResolvedNode,
  type LateLoadAsset,
  type LateLoadPlan,
} from './resolve.ts'
export { lintWriterTruth, type LintIssue } from './lint.ts'
export { exampleA, exampleB, exampleC, ID } from './examples.ts'
export { listOverrideLayers, withDefaultActiveLayers, renameNode } from './layers.ts'
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
