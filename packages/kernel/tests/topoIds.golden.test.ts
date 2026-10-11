import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { idBody, idEdge, idFace, listerTopoPlaque } from '../src/topoIds.ts'

describe('K3-6 topology ids', () => {
  it('format face:/edge:/body:', () => {
    expect(idFace(0)).toBe('face:0')
    expect(idEdge(3)).toBe('edge:3')
    expect(idBody()).toBe('body:0')
  })

  it('plaque 120×80×10 mm : 6 faces, 12 arêtes, ids uniques', async () => {
    const occt = await chargerKernel()
    const out = listerTopoPlaque(occt, 0.12, 0.08, 0.01)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.topo.bodyId).toBe('body:0')
    expect(out.topo.faces).toHaveLength(6)
    expect(out.topo.edges).toHaveLength(12)
    expect(new Set(out.topo.faces.map((f) => f.id)).size).toBe(6)
    expect(new Set(out.topo.edges.map((e) => e.id)).size).toBe(12)
    expect(out.topo.faces.every((f) => /^face:\d+$/.test(f.id))).toBe(true)
    expect(out.topo.edges.every((e) => /^edge:\d+$/.test(e.id))).toBe(true)
    // Surface totale ≈ 2*(120*80 + 120*10 + 80*10) = 23200 mm²
    const aire = out.topo.faces.reduce((s, f) => s + f.area, 0)
    expect(aire).toBeCloseTo(23200, -1)
  }, 120_000)
})
