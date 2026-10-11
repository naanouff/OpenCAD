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
| O2-1 wire/extrude extract | done (`opsExtrude`, `polylinesDepuisResolue`) |
| O2-2 boolean fuse/cut | done (`opsCouper`, `accrocherSolide`) |
| O2-3 history compiler | done (`compilerHistorique`, `opsFillet`) |
| O2-4 revolve + enlever | done (`revolution`, `cercle`/`enlever`) |
| O2-5 editor consume | done (OpenCadEditor `vendor/opencad` → ops re-export) |
| O2-6 GCS cercle | done (`CercleEsquisse`, densify polylines) |
| O2-7 GCS polygone | done (`PolygoneEsquisse`, hex/octo) |
| O2-8 editor GCS consume | done (`./sketch` + editor `esquissePolylines`) |
| O2-9 compiler mm + pipeline bridge | done (`unite: 'mm'`, `./compiler`) |
| O2-10 face.* supports | done (`registreFaces`, extrude/enlever) |
| O2 suite (carrure / plan.3h) | later |

Bootstrap engine: **`occt-kernel`** ([spec](../../documentation/specification/opencad-kernel-v0.md)).

```bash
pnpm install
pnpm fetch:occt   # needs gh auth
pnpm --filter @opencad/kernel test
```
