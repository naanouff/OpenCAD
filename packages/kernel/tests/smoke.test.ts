import { describe, expect, it } from 'vitest'
import { EXPRESSION_DIALECT_V0, identity, rebuild } from '../src/index.ts'

describe('@opencad/kernel smoke', () => {
  it('publie l’identité K3-1', () => {
    expect(identity()).toEqual({
      name: 'OpenCAD Kernel',
      bootstrap: 'occt-kernel',
      dialect: EXPRESSION_DIALECT_V0,
      version: '0.0.0',
    })
  })

  it('accepte le dialecte v0 sans rebuild solide', () => {
    const out = rebuild({
      expressionDialect: EXPRESSION_DIALECT_V0,
      parameters: { largeur: '20', hauteur: 'largeur / 2' },
    })
    expect(out).toEqual({ ok: true, status: 'stub' })
  })

  it('refuse un dialecte inconnu', () => {
    const out = rebuild({ expressionDialect: 'autre.v1' })
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.code).toBe('UnsupportedDialect')
  })
})
