import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { rebuildExtrudePlate } from '../src/extrudePlate.ts'
import { rebuildPlateWithHole } from '../src/plateWithHole.ts'
import { rebuildRevolveCylinder } from '../src/revolveSolid.ts'

describe('K3-4 revolve + hole goldens', () => {
  it('révolution : cylindre r=10 mm h=30 mm', async () => {
    const occt = await chargerKernel()
    const out = rebuildRevolveCylinder(occt, { radius: 0.01, height: 0.03 })
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.mesh.triangleCount).toBeGreaterThan(0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(30, 0)
    const rx = Math.max(Math.abs(out.bbox.xmin), Math.abs(out.bbox.xmax))
    const rz = Math.max(Math.abs(out.bbox.zmin), Math.abs(out.bbox.zmax))
    expect(rx).toBeCloseTo(10, 0)
    expect(rz).toBeCloseTo(10, 0)
  }, 120_000)

  it('plaque 100×60×8 mm + trou Ø10 (boolean cut)', async () => {
    const occt = await chargerKernel()
    const plein = rebuildExtrudePlate(occt, {
      width: 0.1,
      depth: 0.06,
      thickness: 0.008,
    })
    const out = rebuildPlateWithHole(occt, {
      width: 0.1,
      depth: 0.06,
      thickness: 0.008,
      holeDiameter: 0.01,
    })
    expect(plein.ok && out.ok).toBe(true)
    if (!plein.ok || !out.ok) return
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(100, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(60, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(8, 0)
    // Le cut ajoute de la tessellation (paroi du trou).
    expect(out.mesh.triangleCount).toBeGreaterThan(plein.mesh.triangleCount)
  }, 120_000)
})
