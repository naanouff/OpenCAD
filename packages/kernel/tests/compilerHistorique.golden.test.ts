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

  it('O2-10: plaque + bossage sur face.dessus', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'base' },
        { type: 'cote', cible: 'longueur', expression: '100' },
        { type: 'cote', cible: 'largeur', expression: '60' },
        { type: 'extrude', profondeur: '8' },
        { type: 'ouvrir', support: 'face.dessus' },
        { type: 'rectangle', id: 'boss' },
        { type: 'cote', cible: 'longueur', expression: '20' },
        { type: 'cote', cible: 'largeur', expression: '20' },
        { type: 'extrude', profondeur: '5' },
      ],
      { unite: 'mm' },
    )
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(13, 0)
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(100, 0)
  }, 120_000)

  it('O2-14: cornes + élévation (plongee) après anneau', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique(
      [
        { type: 'param', nom: 'diametre_boite', expression: '40' },
        { type: 'param', nom: 'hauteur_carrure', expression: '8' },
        { type: 'param', nom: 'entrecorne', expression: '20' },
        { type: 'param', nom: 'longueur_corne', expression: '4.2' },
        { type: 'param', nom: 'largeur_racine', expression: '6' },
        { type: 'param', nom: 'plongee_bout', expression: '1.2' },
        { type: 'param', nom: 'epaisseur_bout', expression: '2' },
        { type: 'ouvrir' },
        { type: 'cercle', id: 'ext' },
        { type: 'cote', cible: 'diametre', expression: '40' },
        { type: 'cercle', id: 'int' },
        { type: 'concentrique', cible: 'cercle.exterieur' },
        { type: 'cote', cible: 'diametre', expression: '35' },
        { type: 'extrude', profondeur: '8' },
        { type: 'ouvrir' },
        { type: 'segment', id: 's0' },
        { type: 'cote', cible: 'ecart', expression: '20' },
        { type: 'segment', id: 's1' },
        { type: 'cote', cible: 'debord', expression: '4.2' },
        { type: 'cote', cible: 'largeur', expression: '2.2' },
        { type: 'segment', id: 's2' },
        { type: 'cote', cible: 'largeur', expression: '6' },
        { type: 'arc', id: 'a0' },
        { type: 'cote', cible: 'rayon', expression: '3' },
        { type: 'arc', id: 'a1' },
        { type: 'concentrique', cible: 'cercle.exterieur' },
        { type: 'symetrie', axe: 'vertical' },
        { type: 'symetrie', axe: 'horizontal' },
        { type: 'extrude', profondeur: '8' },
      ],
      { unite: 'mm' },
    )
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(8, 0)
    expect(Math.max(Math.abs(out.bbox.zmax), Math.abs(out.bbox.zmin))).toBeGreaterThan(22)
  }, 120_000)

  it('O2-13: anneau deux cercles concentriques + extrude', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'cercle', id: 'ext' },
        { type: 'cote', cible: 'diametre', expression: '40' },
        { type: 'cercle', id: 'int' },
        { type: 'concentrique', cible: 'cercle.exterieur' },
        { type: 'cote', cible: 'diametre', expression: '35' },
        { type: 'extrude', profondeur: '8' },
      ],
      { unite: 'mm' },
    )
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(8, 0)
    const rx = Math.max(Math.abs(out.bbox.xmin), Math.abs(out.bbox.xmax))
    expect(rx).toBeCloseTo(20, 0)
    // Anneau : plus de triangles qu’un disque plein de même enveloppe.
    const plein = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'cercle', id: 'c' },
        { type: 'cote', cible: 'diametre', expression: '40' },
        { type: 'extrude', profondeur: '8' },
      ],
      { unite: 'mm' },
    )
    const a = tessellerSolide(occt, plein.ops, plein.solidAs!)
    expect(a.ok).toBe(true)
    if (!a.ok) return
    expect(out.mesh.triangleCount).toBeGreaterThan(a.mesh.triangleCount)
  }, 120_000)

  it('O2-12: plaque + enlever traverse plan.12h → quatre trous de barrette', async () => {
    const occt = await chargerKernel()
    const plein = compilerHistorique(
      [
        { type: 'param', nom: 'diametre_boite', expression: '40' },
        { type: 'param', nom: 'longueur_corne', expression: '4.2' },
        { type: 'param', nom: 'hauteur_carrure', expression: '8' },
        { type: 'param', nom: 'entrecorne', expression: '20' },
        { type: 'param', nom: 'largeur_racine', expression: '6' },
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '50' },
        { type: 'cote', cible: 'largeur', expression: '50' },
        { type: 'extrude', profondeur: '8' },
      ],
      { unite: 'mm' },
    )
    const bars = compilerHistorique(
      [
        { type: 'param', nom: 'diametre_boite', expression: '40' },
        { type: 'param', nom: 'longueur_corne', expression: '4.2' },
        { type: 'param', nom: 'hauteur_carrure', expression: '8' },
        { type: 'param', nom: 'entrecorne', expression: '20' },
        { type: 'param', nom: 'largeur_racine', expression: '6' },
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '50' },
        { type: 'cote', cible: 'largeur', expression: '50' },
        { type: 'extrude', profondeur: '8' },
        { type: 'ouvrir', support: 'plan.12h' },
        { type: 'cercle', id: 'b' },
        { type: 'cote', cible: 'diametre', expression: '1.1' },
        { type: 'enlever', profondeur: '6', traverse: true },
      ],
      { unite: 'mm' },
    )
    const a = tessellerSolide(occt, plein.ops, plein.solidAs!)
    const b = tessellerSolide(occt, bars.ops, bars.solidAs!)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(b.mesh.triangleCount).toBeGreaterThan(a.mesh.triangleCount)
    expect(b.bbox.ymax - b.bbox.ymin).toBeCloseTo(8, 0)
  }, 120_000)

  it('O2-11: tube plan.3h — axe X, altitude peau, décalage mi-hauteur', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique(
      [
        { type: 'param', nom: 'diametre_boite', expression: '40' },
        { type: 'param', nom: 'hauteur_carrure', expression: '20' },
        { type: 'ouvrir', support: 'plan.3h' },
        { type: 'cercle', id: 'tube' },
        { type: 'cote', cible: 'diametre', expression: '8' },
        { type: 'extrude', profondeur: '15' },
      ],
      { unite: 'mm' },
    )
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    // altitude = 20 − 0.3 ; extrude = 15 + 0.3 → x ∈ [19.7, 35]
    expect(out.bbox.xmin).toBeCloseTo(19.7, 0)
    expect(out.bbox.xmax).toBeCloseTo(35, 0)
    // centre Y = hauteur_carrure/2 = 10 ; rayon 4
    expect((out.bbox.ymin + out.bbox.ymax) / 2).toBeCloseTo(10, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(8, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(8, 0)
  }, 120_000)

  it('O2-10: plaque + poche enlever sur face.dessus', async () => {
    const occt = await chargerKernel()
    const plein = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '100' },
        { type: 'cote', cible: 'largeur', expression: '60' },
        { type: 'extrude', profondeur: '8' },
      ],
      { unite: 'mm' },
    )
    const poche = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '100' },
        { type: 'cote', cible: 'largeur', expression: '60' },
        { type: 'extrude', profondeur: '8' },
        { type: 'ouvrir', support: 'face.dessus' },
        { type: 'cercle', id: 'c' },
        { type: 'cote', cible: 'diametre', expression: '10' },
        { type: 'enlever', profondeur: '4' },
      ],
      { unite: 'mm' },
    )
    const a = tessellerSolide(occt, plein.ops, plein.solidAs!)
    const b = tessellerSolide(occt, poche.ops, poche.solidAs!)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(b.bbox.ymax - b.bbox.ymin).toBeCloseTo(8, 0)
    expect(b.mesh.triangleCount).toBeGreaterThan(a.mesh.triangleCount)
  }, 120_000)

  it('O2-9: unite mm (Session) → même bbox que metres×1000', async () => {
    const occt = await chargerKernel()
    const metres = compilerHistorique([
      { type: 'ouvrir' },
      { type: 'rectangle', id: 'r' },
      { type: 'cote', cible: 'longueur', expression: '0.12' },
      { type: 'cote', cible: 'largeur', expression: '0.08' },
      { type: 'extrude', profondeur: '0.01' },
    ])
    const mm = compilerHistorique(
      [
        { type: 'ouvrir' },
        { type: 'rectangle', id: 'r' },
        { type: 'cote', cible: 'longueur', expression: '120' },
        { type: 'cote', cible: 'largeur', expression: '80' },
        { type: 'extrude', profondeur: '10' },
      ],
      { unite: 'mm' },
    )
    const a = tessellerSolide(occt, metres.ops, metres.solidAs!)
    const b = tessellerSolide(occt, mm.ops, mm.solidAs!)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(b.bbox.xmax - b.bbox.xmin).toBeCloseTo(a.bbox.xmax - a.bbox.xmin, 0)
    expect(b.bbox.ymax - b.bbox.ymin).toBeCloseTo(a.bbox.ymax - a.bbox.ymin, 0)
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

  it('O2-7: hexagone + extrude → bbox entreplat', async () => {
    const occt = await chargerKernel()
    const compilation = compilerHistorique([
      { type: 'ouvrir' },
      { type: 'hexagone', id: 'h' },
      { type: 'cote', cible: 'entreplat', expression: '0.02' },
      { type: 'extrude', profondeur: '0.01' },
    ])
    const out = tessellerSolide(occt, compilation.ops, compilation.solidAs!)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(10, 0)
    // Enveloppe = 2R = entreplat / cos(π/6) (sommets, pas pans)
    const span = 20 / Math.cos(Math.PI / 6)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(span, 0)
  }, 120_000)

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
