import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { compilerHistorique } from '../src/compilerHistorique.ts'
import { tessellerSolide } from '../src/meshUtils.ts'
import { rebuildExtrudeFromRectangle } from '../src/extrudeFromSketch.ts'

describe('O2-3 compiler historique', () => {
  it('compile param + rectangle + cotes + extrude → même bbox que rebuildExtrudeFromRectangle', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique([
      { type: 'param', nom: 'L', expression: '0.12' },
      { type: 'param', nom: 'l', expression: '0.08' },
      { type: 'param', nom: 'e', expression: '0.01' },
      { type: 'ouvrir', support: 'plan.dessus' },
      { type: 'rectangle', id: 'r1' },
      { type: 'cote', cible: 'longueur', expression: 'L' },
      { type: 'cote', cible: 'largeur', expression: 'l' },
      { type: 'extrude', profondeur: 'e' },
    ])
    expect(compilation.solidAs).toBeTruthy()
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return

    const direct = rebuildExtrudeFromRectangle(
      occt,
      { rectangles: [{ id: 'r1', largeur: '0.08', longueur: '0.12' }] },
      0.01,
    )
    expect(direct.ok).toBe(true)
    if (!direct.ok) return

    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(direct.bbox.xmax - direct.bbox.xmin, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(direct.bbox.zmax - direct.bbox.zmin, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(direct.bbox.ymax - direct.bbox.ymin, 0)
  }, 120_000)

  it('fillet après extrude conserve le bbox enveloppe (opsFillet)', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique([
      { type: 'ouvrir' },
      { type: 'rectangle', id: 'r' },
      { type: 'cote', cible: 'longueur', expression: '0.12' },
      { type: 'cote', cible: 'largeur', expression: '0.08' },
      { type: 'extrude', profondeur: '0.01' },
      { type: 'fillet', rayon: '0.001' },
    ])
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(120, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(80, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(10, 0)
  }, 120_000)

  it('refuse extrude sous-contraint', () => {
    expect(() =>
      compilerHistorique([
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '0.12' },
        { type: 'extrude', profondeur: '0.01' },
      ]),
    ).toThrow(/sous-contraint|UnderConstrained|contraint/i)
  })
})
