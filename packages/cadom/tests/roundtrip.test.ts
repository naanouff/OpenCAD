import { describe, expect, it } from 'vitest'
import {
  CADOM_VERSION_MAJOR,
  CADOM_VERSION_MINOR,
  CadomDocument,
  applyOverrides,
  decode,
  encode,
  mat4Identity,
  type CadomLogical,
} from '../src/index.ts'

const ROOT = '11111111-1111-1111-1111-111111111111'
const SUB = '22222222-2222-2222-2222-222222222222'
const PART_A = '33333333-3333-3333-3333-333333333333'
const PART_B = '44444444-4444-4444-4444-444444444444'
const ASSET_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const ASSET_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

function exampleA(): CadomLogical {
  const I = mat4Identity()
  return {
    versionMajor: CADOM_VERSION_MAJOR,
    versionMinor: CADOM_VERSION_MINOR,
    units: 'm',
    upAxis: 'y',
    rootIds: [ROOT],
    assets: [
      { id: ASSET_A, uri: './part-a.glb', kind: 'glb' },
      { id: ASSET_B, uri: './part-b.glb', kind: 'glb' },
    ],
    nodes: [
      {
        id: ROOT,
        parentId: '',
        name: 'Root assembly',
        semanticType: 'assembly',
        visible: true,
        localTransform: I,
        assetBindings: [],
      },
      {
        id: SUB,
        parentId: ROOT,
        name: 'Subassembly',
        semanticType: 'assembly',
        visible: true,
        localTransform: I,
        assetBindings: [],
      },
      {
        id: PART_A,
        parentId: SUB,
        name: 'Part A',
        semanticType: 'part',
        visible: true,
        localTransform: I,
        assetBindings: [{ role: 'mesh', assetId: ASSET_A }],
      },
      {
        id: PART_B,
        parentId: SUB,
        name: 'Part B',
        semanticType: 'part',
        visible: true,
        localTransform: I,
        assetBindings: [{ role: 'mesh', assetId: ASSET_B }],
      },
    ],
    overrides: [],
    extensions: [],
    defaultActiveLayers: [],
  }
}

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
    const payload = Uint8Array.from([0, 101, 120, 97, 109, 112, 108, 101])
    const doc = exampleA()
    doc.extensions = [{ vendor: 'com.example', type: 'kinematics.v1', payload }]
    const back = decode(encode(doc))
    expect(back.extensions).toHaveLength(1)
    expect(back.extensions[0]!.vendor).toBe('com.example')
    expect(back.extensions[0]!.type).toBe('kinematics.v1')
    expect([...back.extensions[0]!.payload]).toEqual([...payload])
  })

  it('CadomDocument getChildren + getWorldMatrix', () => {
    const doc = CadomDocument.fromLogical(exampleA())
    expect(doc.getChildren(ROOT)).toEqual([SUB])
    expect(doc.getChildren(SUB).slice().sort()).toEqual([PART_A, PART_B].sort())
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
