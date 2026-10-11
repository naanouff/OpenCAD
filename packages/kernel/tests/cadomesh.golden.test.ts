import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { rebuildExtrudePlate } from '../src/extrudePlate.ts'
import { bboxFromPositions } from '../src/meshUtils.ts'
import { ecrireCadomesh, lireCadomesh } from '../src/writeCadomesh.ts'

describe('K3-7 cadomesh writer', () => {
  it('écrit et relit la plaque tessellée', async () => {
    const occt = await chargerKernel()
    const solid = rebuildExtrudePlate(occt, {
      width: 0.12,
      depth: 0.08,
      thickness: 0.01,
    })
    expect(solid.ok).toBe(true)
    if (!solid.ok) return
    const bytes = ecrireCadomesh(solid.mesh, { name: 'plate' })
    expect(bytes.byteLength).toBeGreaterThan(100)
    const file = lireCadomesh(bytes)
    expect(file.versionMajor).toBe(0)
    expect(file.versionMinor).toBe(0)
    expect(file.name).toBe('plate')
    expect(file.topology).toBe(1)
    expect(file.units).toBe(2) // mm
    expect(file.positions.length).toBe(solid.mesh.positions.length)
    expect(file.indices.length).toBe(solid.mesh.indices.length)
    expect(file.normals.length).toBe(solid.mesh.positions.length)
    const bbox = bboxFromPositions(file.positions)
    expect(bbox.xmax - bbox.xmin).toBeCloseTo(120, 0)
    expect(bbox.zmax - bbox.zmin).toBeCloseTo(80, 0)
    expect(bbox.ymax - bbox.ymin).toBeCloseTo(10, 0)
  }, 120_000)
})
