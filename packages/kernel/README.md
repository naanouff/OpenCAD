# `@opencad/kernel`

OpenCAD B-Rep kernel package (K3).

| Milestone | Status |
|-----------|--------|
| K3-2 skeleton + CI | done |
| K3-3 extrude plate golden | done (`rebuildExtrudePlate`) |
| K3-4…K5 goldens | next |
| O2 editor pipeline extract | later |

Bootstrap engine: **`occt-kernel`** ([spec](../../documentation/specification/opencad-kernel-v0.md)).

```bash
pnpm install
pnpm fetch:occt   # needs gh auth
pnpm --filter @opencad/kernel test
```
