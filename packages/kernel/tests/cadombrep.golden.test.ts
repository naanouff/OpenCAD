import { describe, expect, it } from 'vitest'
import { chargerKernel } from '../src/chargerKernel.ts'
import { KERNEL_NAME, KERNEL_PRODUCT_VERSION } from '../src/identity.ts'
import {
  ecrireCadombrepPlaque,
  importerBrep,
  lireCadombrep,
} from '../src/writeCadombrep.ts'

describe('K3-8 cadombrep writer', () => {
  it('écrit plaque OCCT_BREP avec topo et réimporte le blob', async () => {
    const occt = await chargerKernel()
    const out = ecrireCadombrepPlaque(occt, 0.12, 0.08, 0.01, {
      name: 'plate',
      sourceCadompartId: 'fixture-plate',
    })
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.bytes.byteLength).toBeGreaterThan(100)
    const file = lireCadombrep(out.bytes)
    expect(file.versionMajor).toBe(0)
    expect(file.name).toBe('plate')
    expect(file.kernelId).toBe(KERNEL_NAME)
    expect(file.kernelVersion).toBe(KERNEL_PRODUCT_VERSION)
    expect(file.encoding).toBe(2) // OCCT_BREP
    expect(file.solidBlob.byteLength).toBeGreaterThan(0)
    expect(file.bodyIds).toEqual(['body:0'])
    expect(file.faceIds).toHaveLength(6)
    expect(file.edgeIds).toHaveLength(12)
    expect(importerBrep(occt, file.solidBlob)).toBe(true)
  }, 120_000)
})
