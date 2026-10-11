import { describe, expect, it } from 'vitest'
import { ecrireCadomesh, lireCadomesh } from '../src/writeCadomesh.ts'

describe('cadomesh browser-safe writer', () => {
  it('encode et décode sans fs (maillage synthétique)', () => {
    const mesh = {
      triangleCount: 1,
      positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
      normales: [0, 0, 1, 0, 0, 1, 0, 0, 1],
      indices: [0, 1, 2],
    }
    const bytes = ecrireCadomesh(mesh, { name: 'tri' })
    expect(bytes.byteLength).toBeGreaterThan(20)
    const file = lireCadomesh(bytes)
    expect(file.name).toBe('tri')
    expect(file.units).toBe(2)
    expect(file.topology).toBe(1)
    expect(file.positions).toEqual(mesh.positions)
    expect(file.indices).toEqual(mesh.indices)
    expect(file.normals).toEqual(mesh.normales)
  })
})
