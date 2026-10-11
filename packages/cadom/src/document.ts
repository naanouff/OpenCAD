import {
  mat4Copy,
  mat4Identity,
  mat4Multiply,
  type CadomAsset,
  type CadomExtension,
  type CadomLogical,
  type CadomNode,
  type CadomOverride,
} from './types.ts'

/**
 * Flat UUID graph with O(1) lookup.
 * Source nodes are not mutated by override views.
 */
export class CadomDocument {
  readonly versionMajor: number
  readonly versionMinor: number
  readonly units: CadomLogical['units']
  readonly upAxis: CadomLogical['upAxis']
  readonly rootIds: readonly string[]
  readonly nodes: Map<string, CadomNode>
  readonly assets: Map<string, CadomAsset>
  readonly overrides: readonly CadomOverride[]
  readonly extensions: readonly CadomExtension[]
  readonly defaultActiveLayers: readonly string[]

  private children = new Map<string, string[]>()

  constructor(logical: CadomLogical) {
    this.versionMajor = logical.versionMajor
    this.versionMinor = logical.versionMinor
    this.units = logical.units
    this.upAxis = logical.upAxis
    this.rootIds = [...logical.rootIds]
    this.nodes = new Map(
      logical.nodes.map((n) => [
        n.id,
        {
          ...n,
          localTransform: mat4Copy(n.localTransform),
          assetBindings: n.assetBindings.map((b) => ({ ...b })),
        },
      ]),
    )
    this.assets = new Map(logical.assets.map((a) => [a.id, { ...a }]))
    this.overrides = logical.overrides.map((o) => ({
      ...o,
      localTransform: o.localTransform ? mat4Copy(o.localTransform) : undefined,
    }))
    this.extensions = logical.extensions.map((e) => ({
      vendor: e.vendor,
      type: e.type,
      payload: new Uint8Array(e.payload),
    }))
    this.defaultActiveLayers = [...logical.defaultActiveLayers]
    this.rebuildChildren()
  }

  static fromLogical(logical: CadomLogical): CadomDocument {
    return new CadomDocument(logical)
  }

  toLogical(): CadomLogical {
    return {
      versionMajor: this.versionMajor,
      versionMinor: this.versionMinor,
      units: this.units,
      upAxis: this.upAxis,
      rootIds: [...this.rootIds],
      nodes: [...this.nodes.values()].map((n) => ({
        ...n,
        localTransform: mat4Copy(n.localTransform),
        assetBindings: n.assetBindings.map((b) => ({ ...b })),
      })),
      assets: [...this.assets.values()].map((a) => ({ ...a })),
      overrides: this.overrides.map((o) => ({
        ...o,
        localTransform: o.localTransform ? mat4Copy(o.localTransform) : undefined,
      })),
      extensions: this.extensions.map((e) => ({
        vendor: e.vendor,
        type: e.type,
        payload: new Uint8Array(e.payload),
      })),
      defaultActiveLayers: [...this.defaultActiveLayers],
    }
  }

  getChildren(id: string): readonly string[] {
    return this.children.get(id) ?? []
  }

  getWorldMatrix(id: string): Float32Array {
    const chain: CadomNode[] = []
    let cur: string | undefined = id
    const seen = new Set<string>()
    while (cur) {
      if (seen.has(cur)) throw new Error(`cadom: cycle at ${cur}`)
      seen.add(cur)
      const node = this.nodes.get(cur)
      if (!node) throw new Error(`cadom: unknown node ${cur}`)
      chain.push(node)
      cur = node.parentId || undefined
    }
    let world = mat4Identity()
    for (let i = chain.length - 1; i >= 0; i--) {
      world = mat4Multiply(world, chain[i]!.localTransform)
    }
    return world
  }

  private rebuildChildren() {
    this.children.clear()
    for (const n of this.nodes.values()) {
      const parent = n.parentId || ''
      const list = this.children.get(parent) ?? []
      list.push(n.id)
      this.children.set(parent, list)
    }
  }
}
