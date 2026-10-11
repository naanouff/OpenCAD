import { CadomDocument } from './document.ts'
import { applyOverrides } from './overrides.ts'
import {
  mat4Copy,
  mat4Identity,
  mat4Multiply,
  type AssetKind,
  type AssetRole,
} from './types.ts'

/**
 * Adapter-facing resolved node (plan MVP A / w3dts mapping §10).
 * No w3dts dependency — consumers map fields into SceneNode / ECS.
 */
export type CadomResolvedNode = {
  id: string
  parentId: string
  name: string
  localTransform: Float32Array
  worldTransform: Float32Array
  /** MESH role URI (cadomesh / glb / gltf). */
  geometryUri?: string
  parametricUri?: string
  exactUri?: string
  materialUri?: string
  materialRef?: string
  visible: boolean
  semanticType?: string
  appliedLayers: string[]
}

export type LateLoadAsset = {
  assetId: string
  uri: string
  kind: AssetKind
  role: AssetRole
  /** Nodes that bind this asset under the given role. */
  nodeIds: string[]
}

/**
 * Fetch plan after the graph is in memory: mesh first, then exact / parametric / rest.
 * Callers late-load URIs asynchronously; the SDK never fetches.
 */
export type LateLoadPlan = {
  assets: LateLoadAsset[]
}

const ROLE_ORDER: AssetRole[] = ['mesh', 'exact', 'parametric', 'material', 'metadata', 'unspecified']

function uriForRole(
  doc: CadomDocument,
  bindings: { role: AssetRole; assetId: string }[],
  role: AssetRole,
  legacyAssetId?: string,
): string | undefined {
  const hit = bindings.find((b) => b.role === role)
  if (hit) {
    const a = doc.assets.get(hit.assetId)
    return a?.uri
  }
  if (role === 'mesh' && legacyAssetId) {
    return doc.assets.get(legacyAssetId)?.uri
  }
  return undefined
}

function worldFromLocals(
  id: string,
  locals: Map<string, { parentId: string; localTransform: Float32Array }>,
): Float32Array {
  const chain: Float32Array[] = []
  let cur: string | undefined = id
  const seen = new Set<string>()
  while (cur) {
    if (seen.has(cur)) throw new Error(`cadom: cycle at ${cur}`)
    seen.add(cur)
    const n = locals.get(cur)
    if (!n) throw new Error(`cadom: unknown node ${cur}`)
    chain.push(n.localTransform)
    cur = n.parentId || undefined
  }
  let world = mat4Identity()
  for (let i = chain.length - 1; i >= 0; i--) {
    world = mat4Multiply(world, chain[i]!)
  }
  return world
}

/**
 * Resolved scene snapshot for a future adapter: overrides applied, world matrices,
 * role URIs filled — assets themselves are not loaded.
 */
export function resolveForAdapter(
  doc: CadomDocument,
  layers?: readonly string[],
): CadomResolvedNode[] {
  const resolved = applyOverrides(doc, layers)
  const locals = new Map(
    [...resolved.entries()].map(([id, n]) => [
      id,
      { parentId: n.parentId, localTransform: n.localTransform },
    ]),
  )
  const out: CadomResolvedNode[] = []
  for (const [id, n] of resolved) {
    out.push({
      id,
      parentId: n.parentId,
      name: n.name,
      localTransform: mat4Copy(n.localTransform),
      worldTransform: worldFromLocals(id, locals),
      geometryUri: uriForRole(doc, n.assetBindings, 'mesh', n.assetId),
      parametricUri: uriForRole(doc, n.assetBindings, 'parametric'),
      exactUri: uriForRole(doc, n.assetBindings, 'exact'),
      materialUri: uriForRole(doc, n.assetBindings, 'material'),
      materialRef: n.materialRef,
      visible: n.visible !== false,
      semanticType: n.semanticType,
      appliedLayers: [...n.appliedLayers],
    })
  }
  return out
}

/** Graph-first late-load plan: unique assets ordered by viz priority. */
export function planLateLoad(doc: CadomDocument): LateLoadPlan {
  type Acc = LateLoadAsset & { _roles: Set<AssetRole> }
  const byId = new Map<string, Acc>()

  const add = (assetId: string, role: AssetRole, nodeId: string) => {
    const asset = doc.assets.get(assetId)
    if (!asset) return
    let cur = byId.get(assetId)
    if (!cur) {
      cur = {
        assetId,
        uri: asset.uri,
        kind: asset.kind,
        role,
        nodeIds: [],
        _roles: new Set(),
      }
      byId.set(assetId, cur)
    }
    cur._roles.add(role)
    if (!cur.nodeIds.includes(nodeId)) cur.nodeIds.push(nodeId)
    // Prefer highest-priority role label when an asset is multi-bound.
    const best = ROLE_ORDER.find((r) => cur!._roles.has(r)) ?? role
    cur.role = best
  }

  for (const n of doc.nodes.values()) {
    for (const b of n.assetBindings) add(b.assetId, b.role, n.id)
    if (n.assetId) add(n.assetId, 'mesh', n.id)
  }

  const assets = [...byId.values()]
    .map(({ _roles: _, ...rest }) => rest)
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))

  return { assets }
}
