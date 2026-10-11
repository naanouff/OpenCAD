import { describe, expect, it } from 'vitest'
import {
  CadomDocument,
  ID,
  exampleA,
  exampleB,
  lintWriterTruth,
  planLateLoad,
  resolveForAdapter,
} from '../src/index.ts'

describe('O4-3 resolve + late-load + lint', () => {
  it('resolveForAdapter fills mesh URIs and world matrices', () => {
    const logical = exampleA()
    logical.nodes.find((n) => n.id === ID.sub)!.localTransform = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1,
    ])
    const scene = resolveForAdapter(CadomDocument.fromLogical(logical))
    const partA = scene.find((n) => n.id === ID.partA)!
    expect(partA.geometryUri).toBe('./part-a.glb')
    expect(partA.worldTransform[12]).toBeCloseTo(2)
    expect(partA.visible).toBe(true)
  })

  it('resolveForAdapter applies override visibility without mutating source', () => {
    const doc = CadomDocument.fromLogical(exampleB())
    const scene = resolveForAdapter(doc)
    expect(scene.find((n) => n.id === ID.partA)!.visible).toBe(false)
    expect(scene.find((n) => n.id === ID.partA)!.appliedLayers).toEqual(['review'])
    expect(doc.nodes.get(ID.partA)!.visible).toBe(true)
  })

  it('planLateLoad lists mesh assets first', () => {
    const plan = planLateLoad(CadomDocument.fromLogical(exampleA()))
    expect(plan.assets.map((a) => a.uri)).toEqual(['./part-a.glb', './part-b.glb'])
    expect(plan.assets.every((a) => a.role === 'mesh')).toBe(true)
    expect(plan.assets.find((a) => a.uri === './part-a.glb')!.nodeIds).toEqual([ID.partA])
  })

  it('lintWriterTruth flags STEP as truth and EXACT→STEP', () => {
    const logical = exampleA()
    logical.assets.push({
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      uri: './legacy.step',
      kind: 'step',
    })
    logical.nodes.find((n) => n.id === ID.partB)!.assetBindings.push({
      role: 'exact',
      assetId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    })
    const issues = lintWriterTruth(CadomDocument.fromLogical(logical))
    expect(issues.some((i) => i.code === 'step_as_truth')).toBe(true)
    expect(issues.some((i) => i.code === 'exact_bound_to_step')).toBe(true)
  })

  it('lintWriterTruth clean on example A', () => {
    expect(lintWriterTruth(CadomDocument.fromLogical(exampleA()))).toEqual([])
  })
})
