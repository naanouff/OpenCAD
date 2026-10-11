import { CadomDocument } from './document.ts'
import { mat4Copy, type CadomNode } from './types.ts'

export type ResolvedCadomNode = CadomNode & {
  /** Layers that contributed to this resolution (informative). */
  appliedLayers: string[]
  materialRef?: string
}

/**
 * Non-destructive override view.
 * Source `doc.nodes` stay intact; returned map is a resolved snapshot.
 */
export function applyOverrides(
  doc: CadomDocument,
  layers?: readonly string[],
): Map<string, ResolvedCadomNode> {
  const active = new Set(layers ?? doc.defaultActiveLayers)
  const out = new Map<string, ResolvedCadomNode>()
  for (const [id, node] of doc.nodes) {
    out.set(id, {
      ...node,
      localTransform: mat4Copy(node.localTransform),
      assetBindings: node.assetBindings.map((b) => ({ ...b })),
      appliedLayers: [],
    })
  }
  for (const ov of doc.overrides) {
    if (active.size > 0 && !active.has(ov.layer)) continue
    const cur = out.get(ov.nodeId)
    if (!cur) continue
    if (ov.visible !== undefined) cur.visible = ov.visible
    if (ov.materialRef !== undefined) cur.materialRef = ov.materialRef
    if (ov.localTransform) cur.localTransform = mat4Copy(ov.localTransform)
    cur.appliedLayers.push(ov.layer)
  }
  return out
}
