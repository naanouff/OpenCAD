import { describe, expect, it } from 'vitest'
import { chargerKernel, runBatch } from '../src/chargerKernel.ts'
import { compilerHistorique, type OperationKernel } from '../src/compilerHistorique.ts'
import { tessellerSolide } from '../src/meshUtils.ts'

async function nombreDeFaces(historique: OperationKernel[]) {
  const occt = await chargerKernel()
  const compilation = compilerHistorique(historique, { unite: 'mm' })
  const out = runBatch(occt, [
    { op: 'arena_clear' },
    ...compilation.ops,
    { op: 'list_faces', args: [{ handle: compilation.solidAs! }], as: 'faces' },
  ])
  expect(out.ok).toBe(true)
  return {
    faces: (out.aliases?.faces as { faces: unknown[] }).faces.length,
    tesselle: tessellerSolide(occt, compilation.ops, compilation.solidAs!),
  }
}

describe('cercle d’esquisse en surface exacte', () => {
  it('extrude un disque en cylindre : paroi, dessus, dessous', async () => {
    const { faces, tesselle } = await nombreDeFaces([
      { type: 'ouvrir' },
      { type: 'cercle', id: 'c' },
      { type: 'cote', cible: 'diametre', expression: '40' },
      { type: 'extrude', profondeur: '8' },
    ])
    expect(faces).toBe(3)
    expect(tesselle.ok).toBe(true)
    if (!tesselle.ok) return
    expect(tesselle.bbox.ymax - tesselle.bbox.ymin).toBeCloseTo(8, 3)
    expect(tesselle.bbox.xmax).toBeCloseTo(20, 3)
  })

  it('perce une plaque d’un trou à une seule paroi', async () => {
    const { faces } = await nombreDeFaces([
      { type: 'ouvrir' },
      { type: 'rectangle' },
      { type: 'cote', cible: 'longueur', expression: '20' },
      { type: 'cote', cible: 'largeur', expression: '20' },
      { type: 'extrude', profondeur: '8' },
      { type: 'ouvrir', support: 'face.dessus' },
      { type: 'cercle', id: 'trou' },
      { type: 'cote', cible: 'diametre', expression: '8' },
      { type: 'enlever', profondeur: '2', traverse: false },
    ])
    // 6 faces de la plaque + paroi + fond du trou.
    expect(faces).toBe(8)
  })
})
