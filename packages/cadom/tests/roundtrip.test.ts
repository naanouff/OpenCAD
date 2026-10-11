import { describe, expect, it } from 'vitest'
import {
  CadomDocument,
  applyOverrides,
  decode,
  encode,
  exampleA,
  exampleC,
  ID,
} from '../src/index.ts'

const ROOT = ID.root
const SUB = ID.sub
const PART_A = ID.partA
const ASSET_A = ID.assetA

describe('O4-1 @opencad/cadom', () => {
  it('round-trip encode/decode assembly (example A)', () => {
    const bytes = encode(exampleA())
    expect(bytes.byteLength).toBeGreaterThan(20)
    const back = decode(bytes)
    expect(back.versionMajor).toBe(0)
    expect(back.versionMinor).toBe(6)
    expect(back.units).toBe('m')
    expect(back.upAxis).toBe('y')
    expect(back.rootIds).toEqual([ROOT])
    expect(back.nodes).toHaveLength(4)
    expect(back.assets.map((a) => a.kind)).toEqual(['glb', 'glb'])
    expect(back.nodes.find((n) => n.id === PART_A)!.assetBindings[0]!.assetId).toBe(ASSET_A)
  })

  it('preserves unknown extension payload (example C)', () => {
    const doc = exampleC()
    const payload = doc.extensions[0]!.payload
    const back = decode(encode(doc))
    expect(back.extensions).toHaveLength(1)
    expect(back.extensions[0]!.vendor).toBe('com.example')
    expect(back.extensions[0]!.type).toBe('kinematics.v1')
    expect([...back.extensions[0]!.payload]).toEqual([...payload])
  })

  it('CadomDocument getChildren + getWorldMatrix', () => {
    const doc = CadomDocument.fromLogical(exampleA())
    expect(doc.getChildren(ROOT)).toEqual([SUB])
    expect(doc.getChildren(SUB).slice().sort()).toEqual([ID.partA, ID.partB].sort())
    const t = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1])
    const logical = exampleA()
    logical.nodes.find((n) => n.id === SUB)!.localTransform = t
    const moved = CadomDocument.fromLogical(logical)
    const world = moved.getWorldMatrix(PART_A)
    expect(world[12]).toBeCloseTo(2)
    expect(world[13]).toBeCloseTo(0)
  })

  it('applyOverrides does not mutate source nodes', () => {
    const logical = exampleA()
    logical.overrides = [{ nodeId: PART_A, layer: 'hide', visible: false }]
    logical.defaultActiveLayers = ['hide']
    const doc = CadomDocument.fromLogical(logical)
    const before = doc.nodes.get(PART_A)!.visible
    const resolved = applyOverrides(doc)
    expect(resolved.get(PART_A)!.visible).toBe(false)
    expect(doc.nodes.get(PART_A)!.visible).toBe(before)
    expect(resolved.get(PART_A)!.appliedLayers).toEqual(['hide'])
  })
})
