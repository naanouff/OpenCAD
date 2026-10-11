import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { rebuildExtrudePlate } from '../src/extrudePlate.ts'

/** Golden: fixtures/cadompart/example-extruded-plate.md (120×80×10 mm). */
describe('K3-3 extrude plate golden', () => {
  it('rebuild + tesselle la plaque 0.12×0.08×0.01 m', async () => {
    const occt = await chargerKernel()
    const out = rebuildExtrudePlate(occt, {
      width: 0.12,
      depth: 0.08,
      thickness: 0.01,
    })
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.mesh.triangleCount).toBeGreaterThan(0)
    expect(out.bbox.xmax - out.bbox.xmin).toBeCloseTo(120, 0)
    expect(out.bbox.ymax - out.bbox.ymin).toBeCloseTo(10, 0)
    expect(out.bbox.zmax - out.bbox.zmin).toBeCloseTo(80, 0)
  }, 120_000)
})
