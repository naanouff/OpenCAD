import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { compilerHistorique } from '../src/compilerHistorique.ts'
import { tessellerSolide } from '../src/meshUtils.ts'
import { rebuildExtrudeFromRectangle } from '../src/extrudeFromSketch.ts'
import { rebuildExtrudePlate } from '../src/extrudePlate.ts'
import { polylinesDepuisResolue } from '../src/polylinesDepuisResolue.ts'
import { resoudreEsquisse } from '../src/sketchSolve.ts'
import { rebuildRevolveCylinder } from '../src/revolveSolid.ts'

describe('O2-3/O2-4 compiler historique', () => {
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

  it('O2-4: revolution profil → même bbox que rebuildRevolveCylinder', async () => {
    const occt = await chargerKernel()
    const pts: Array<{ r: string; h: string }> = [
      { r: '0', h: '0' },
      { r: '0.01', h: '0' },
      { r: '0.01', h: '0.03' },
      { r: '0', h: '0.03' },
    ]
    const historique = [
      { type: 'ouvrir' as const, support: 'plan.12h' },
      ...pts.flatMap((p, i) => [
        { type: 'segment' as const, id: `s${i}` },
        { type: 'cote' as const, cible: 'rayon' as const, expression: p.r },
        { type: 'cote' as const, cible: 'hauteur' as const, expression: p.h },
      ]),
      { type: 'revolution' as const },
    ]
    const compilation = compilerHistorique(historique)
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    const direct = rebuildRevolveCylinder(occt, { radius: 0.01, height: 0.03 })
    expect(direct.ok).toBe(true)
    if (!direct.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(direct.bbox.ymax - direct.bbox.ymin, 0)
    const rx = Math.max(Math.abs(out.bbox.xmin), Math.abs(out.bbox.xmax))
    expect(rx).toBeCloseTo(10, 0)
  }, 120_000)

  it('O2-6: densifie un cercle GCS en polyline fermée', () => {
    const resolue = resoudreEsquisse({ cercles: [{ id: 'c', diametre: '0.02' }] })
    const polys = polylinesDepuisResolue(resolue, { echelle: 1000, segmentsCercle: 32 })
    expect(polys).toHaveLength(1)
    expect(polys[0]!.length).toBeGreaterThanOrEqual(32 * 3)
    const xs = []
    for (let i = 0; i < polys[0]!.length; i += 3) xs.push(Math.abs(polys[0]![i]!))
    expect(Math.max(...xs)).toBeCloseTo(10, 0)
  })

  it('O2-6: extrude cercle GCS → cylindre bbox', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique([
      { type: 'ouvrir' },
      { type: 'cercle', id: 'c' },
      { type: 'cote', cible: 'diametre', expression: '0.02' },
      { type: 'extrude', profondeur: '0.03' },
    ])
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(30, 0)
    const rx = Math.max(Math.abs(out.bbox.xmin), Math.abs(out.bbox.xmax))
    expect(rx).toBeCloseTo(10, 0)
  }, 120_000)

  it('O2-4: extrude + cercle + enlever → bbox plaque, plus de triangles', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique([
      { type: 'ouvrir' },
      { type: 'rectangle', id: 'r' },
      { type: 'cote', cible: 'longueur', expression: '0.1' },
      { type: 'cote', cible: 'largeur', expression: '0.06' },
      { type: 'extrude', profondeur: '0.008' },
      { type: 'ouvrir' },
      { type: 'cercle', id: 'trou' },
      { type: 'cote', cible: 'diametre', expression: '0.01' },
      { type: 'enlever', profondeur: '0.008' },
    ])
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    const plein = rebuildExtrudePlate(occt, {
      width: 0.1,
      depth: 0.06,
      thickness: 0.008,
    })
    expect(plein.ok).toBe(true)
    if (!plein.ok) return
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(100, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(60, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(8, 0)
    expect(out.mesh.triangleCount).toBeGreaterThan(plein.mesh.triangleCount)
  }, 120_000)
})
