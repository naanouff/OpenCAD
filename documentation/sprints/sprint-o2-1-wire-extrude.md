# Sprint O2-1 — Wire / extrude extract

Issue: [#73](https://github.com/naanouff/OpenCAD/issues/73). Branche: `feature/o2-1-wire-extrude`.

## But

Premier morceau du pipeline éditeur dans `@opencad/kernel` : esquisse résolue → wire → extrude.

## Périmètre

1. `opsExtrude` / `opsRevolution` (miroir shell).
2. `polylinesDepuisResolue` (UV → XZY mm).
3. `rebuildExtrudeFromRectangle` sans `make_box`.

## État

Codé sur `feature/o2-1-wire-extrude`.
