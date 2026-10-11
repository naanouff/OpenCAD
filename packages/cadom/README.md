# `@opencad/cadom`

CADOM graph SDK (O4). Decode / encode `.cadom`, flat UUID `CadomDocument`, non-destructive overrides, extension pass-through.

| Milestone | Status |
|-----------|--------|
| O4-1 decode/encode + document + overrides | done |
| O4-2 binary fixtures + layer helpers | done |

Spec: [`documentation/specification/cadom-v0.1.md`](../../documentation/specification/cadom-v0.1.md) (document v0.3.3, `version_minor = 6`).

```bash
pnpm --filter @opencad/cadom test
pnpm --filter @opencad/cadom fixtures   # regenerate fixtures/cadom/*.cadom
```
