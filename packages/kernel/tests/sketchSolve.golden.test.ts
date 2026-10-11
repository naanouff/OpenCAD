import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { rebuildExtrudeFromRectangle } from '../src/extrudeFromSketch.ts'
import { resoudreEsquisse } from '../src/sketchSolve.ts'

describe('K3-5 sketch constraints', () => {
  it('contraint : rectangle coté → 4 coins centrés', () => {
    const out = resoudreEsquisse({
      rectangles: [{ id: 'r1', largeur: '0.08', longueur: '0.12' }],
    })
    expect(out.statut).toBe('contraint')
    expect(out.degres).toBe(0)
    expect(out.ferme).toBe(true)
    const pts = Object.fromEntries(out.points.map((p) => [p.id, p]))
    expect(pts['r1.a']!.u).toBeCloseTo(-0.06)
    expect(pts['r1.a']!.v).toBeCloseTo(-0.04)
    expect(pts['r1.b']!.u).toBeCloseTo(0.06)
  })

  it('sous-contraint si une cote manque', () => {
    const out = resoudreEsquisse({
      rectangles: [{ id: 'r1', longueur: '0.12' }],
    })
    expect(out.statut).toBe('sous-contraint')
    expect(out.degres).toBeGreaterThan(0)
  })

  it('surcontraint si distance conflictuelle', () => {
    const out = resoudreEsquisse(
      { rectangles: [{ id: 'r1', largeur: '0.08', longueur: '0.12' }] },
      new Map(),
      { contraintesExtra: [{ sorte: 'distance', a: 'r1.a', b: 'r1.b', valeur: 99 }] },
    )
    expect(out.statut).toBe('surcontraint')
  })

  it('paramètre qui double la longueur', () => {
    const esquisse = { rectangles: [{ id: 'r', largeur: 'l', longueur: 'L' }] }
    const a = resoudreEsquisse(esquisse, new Map([['L', '0.12'], ['l', '0.08']]))
    const b = resoudreEsquisse(esquisse, new Map([['L', '0.24'], ['l', '0.08']]))
    expect(a.statut).toBe('contraint')
    const ua = a.points.find((p) => p.id.endsWith('.b'))!.u
    const ub = b.points.find((p) => p.id.endsWith('.b'))!.u
    expect(ub).toBeCloseTo(ua * 2)
  })

  it('extrude refuse une esquisse sous-contrainte', async () => {
    const occt = await chargerKernel()
    const out = rebuildExtrudeFromRectangle(
      occt,
      { rectangles: [{ id: 'r1', longueur: '0.12' }] },
      0.01,
    )
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.code).toBe('UnderConstrained')
  }, 120_000)

  it('extrude plaque depuis rectangle contraint (golden mesh)', async () => {
    const occt = await chargerKernel()
    const out = rebuildExtrudeFromRectangle(
      occt,
      { rectangles: [{ id: 'r1', largeur: '0.08', longueur: '0.12' }] },
      0.01,
    )
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(120, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(80, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(10, 0)
  }, 120_000)
})
