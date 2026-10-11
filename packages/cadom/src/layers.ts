import type { CadomDocument } from './document.ts'
import type { CadomLogical } from './types.ts'

/** Distinct override layer names present on the document (sorted). */
export function listOverrideLayers(doc: CadomDocument | CadomLogical): string[] {
  const overrides = 'overrides' in doc && Array.isArray(doc.overrides) ? doc.overrides : []
  const names = new Set<string>()
  for (const o of overrides) {
    if (o.layer) names.add(o.layer)
  }
  return [...names].sort()
}

/** Copy logical doc with a new default active layer list (sources otherwise unchanged). */
export function withDefaultActiveLayers(
  logical: CadomLogical,
  layers: readonly string[],
): CadomLogical {
  return {
    ...logical,
    nodes: logical.nodes.map((n) => ({
      ...n,
      localTransform: Float32Array.from(n.localTransform),
      assetBindings: n.assetBindings.map((b) => ({ ...b })),
    })),
    assets: logical.assets.map((a) => ({ ...a })),
    overrides: logical.overrides.map((o) => ({
      ...o,
      localTransform: o.localTransform ? Float32Array.from(o.localTransform) : undefined,
    })),
    extensions: logical.extensions.map((e) => ({
      vendor: e.vendor,
      type: e.type,
      payload: new Uint8Array(e.payload),
    })),
    rootIds: [...logical.rootIds],
    defaultActiveLayers: [...layers],
  }
}

/** Rename a node; extensions and overrides keep targeting by id. */
export function renameNode(logical: CadomLogical, id: string, name: string): CadomLogical {
  const next = withDefaultActiveLayers(logical, logical.defaultActiveLayers)
  const node = next.nodes.find((n) => n.id === id)
  if (!node) throw new Error(`cadom: unknown node ${id}`)
  node.name = name
  return next
}
