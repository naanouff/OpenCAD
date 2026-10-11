/**
 * Logical fixtures aligned with `fixtures/example-*.md` (SPEC-10).
 */
import {
  CADOM_VERSION_MAJOR,
  CADOM_VERSION_MINOR,
  mat4Identity,
  type CadomLogical,
} from './types.ts'

export const ID = {
  root: '11111111-1111-1111-1111-111111111111',
  sub: '22222222-2222-2222-2222-222222222222',
  partA: '33333333-3333-3333-3333-333333333333',
  partB: '44444444-4444-4444-4444-444444444444',
  assetA: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  assetB: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
} as const

/** Example A — three-level assembly. */
export function exampleA(): CadomLogical {
  const I = mat4Identity()
  return {
    versionMajor: CADOM_VERSION_MAJOR,
    versionMinor: CADOM_VERSION_MINOR,
    units: 'm',
    upAxis: 'y',
    rootIds: [ID.root],
    assets: [
      { id: ID.assetA, uri: './part-a.glb', kind: 'glb' },
      { id: ID.assetB, uri: './part-b.glb', kind: 'glb' },
    ],
    nodes: [
      {
        id: ID.root,
        parentId: '',
        name: 'Root assembly',
        semanticType: 'assembly',
        visible: true,
        localTransform: I,
        assetBindings: [],
      },
      {
        id: ID.sub,
        parentId: ID.root,
        name: 'Subassembly',
        semanticType: 'assembly',
        visible: true,
        localTransform: I,
        assetBindings: [],
      },
      {
        id: ID.partA,
        parentId: ID.sub,
        name: 'Part A',
        semanticType: 'part',
        visible: true,
        localTransform: I,
        assetBindings: [{ role: 'mesh', assetId: ID.assetA }],
      },
      {
        id: ID.partB,
        parentId: ID.sub,
        name: 'Part B',
        semanticType: 'part',
        visible: true,
        localTransform: I,
        assetBindings: [{ role: 'mesh', assetId: ID.assetB }],
      },
    ],
    overrides: [],
    extensions: [],
    defaultActiveLayers: [],
  }
}

/** Example B — visibility override on Part A (`review` layer). */
export function exampleB(): CadomLogical {
  const doc = exampleA()
  doc.overrides = [{ nodeId: ID.partA, layer: 'review', visible: false }]
  doc.defaultActiveLayers = ['review']
  return doc
}

/** Example C — opaque kinematics extension. */
export function exampleC(): CadomLogical {
  const doc = exampleA()
  // base64 AGV4YW1wbGUta2luZW1hdGljcy1ibG9i (fixture doc)
  const b64 = 'AGV4YW1wbGUta2luZW1hdGljcy1ibG9i'
  const bin = atob(b64)
  const payload = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) payload[i] = bin.charCodeAt(i)
  doc.extensions = [{ vendor: 'com.example', type: 'kinematics.v1', payload }]
  return doc
}
