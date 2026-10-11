import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CadomDocument,
  applyOverrides,
  decode,
  encode,
  exampleA,
  exampleB,
  exampleC,
  listOverrideLayers,
  renameNode,
  withDefaultActiveLayers,
  ID,
} from '../src/index.ts'

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'fixtures', 'cadom')

describe('O4-2 binary fixtures + layers', () => {
  it('loads committed example-a.cadom', () => {
    const bytes = readFileSync(join(fixtureDir, 'example-a-three-level-assembly.cadom'))
    const doc = decode(bytes)
    expect(doc.rootIds).toEqual([ID.root])
    expect(doc.nodes).toHaveLength(4)
    expect(encode(doc).byteLength).toBeGreaterThan(20)
  })

  it('example-b: review layer hides Part A', () => {
    const bytes = readFileSync(join(fixtureDir, 'example-b-visibility-override.cadom'))
    const logical = decode(bytes)
    expect(listOverrideLayers(logical)).toEqual(['review'])
    const resolved = applyOverrides(CadomDocument.fromLogical(logical))
    expect(resolved.get(ID.partA)!.visible).toBe(false)
    expect(resolved.get(ID.partB)!.visible).toBe(true)
    // inactive layer → no hide
    const inactive = applyOverrides(CadomDocument.fromLogical(logical), [])
    expect(inactive.get(ID.partA)!.visible).toBe(true)
  })

  it('example-c: rename preserves extension payload', () => {
    const bytes = readFileSync(join(fixtureDir, 'example-c-passthrough-extension.cadom'))
    const logical = decode(bytes)
    const renamed = renameNode(logical, ID.partA, 'Part A (renamed)')
    const back = decode(encode(renamed))
    expect(back.nodes.find((n) => n.id === ID.partA)!.name).toBe('Part A (renamed)')
    expect(back.extensions).toHaveLength(1)
    expect(back.extensions[0]!.vendor).toBe('com.example')
    expect([...back.extensions[0]!.payload]).toEqual([...exampleC().extensions[0]!.payload])
  })

  it('withDefaultActiveLayers + builders match binaries', () => {
    expect(decode(encode(exampleA())).nodes).toHaveLength(4)
    expect(decode(encode(exampleB())).defaultActiveLayers).toEqual(['review'])
    const switched = withDefaultActiveLayers(exampleB(), [])
    expect(switched.defaultActiveLayers).toEqual([])
    expect(listOverrideLayers(switched)).toEqual(['review'])
  })
})
