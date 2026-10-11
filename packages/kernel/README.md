# `@opencad/kernel`

OpenCAD B-Rep kernel package (K3).

| Milestone | Status |
|-----------|--------|
| K3-2 skeleton + CI | done |
| K3-3 extrude plate golden | done (`rebuildExtrudePlate`) |
| K3-4 revolve + hole | done (`rebuildRevolveCylinder`, `rebuildPlateWithHole`) |
| K3-5 sketch constraints | done (`resoudreEsquisse`, `rebuildExtrudeFromRectangle`) |
| K3-6 id faces/edges | done (`listerTopo`, `face:{i}` / `edge:{i}`) |
| K3-7 cadomesh writer | done (`ecrireCadomesh`) |
| K3-8 cadombrep writer | done (`ecrireCadombrep`) |
| Required badge v0 | K3-3…K3-5 + K3-7 |
| Complete export v0 | Required + K3-8 |
| O2 editor pipeline extract | later |

Bootstrap engine: **`occt-kernel`** ([spec](../../documentation/specification/opencad-kernel-v0.md)).

```bash
pnpm install
pnpm fetch:occt   # needs gh auth
pnpm --filter @opencad/kernel test
```
