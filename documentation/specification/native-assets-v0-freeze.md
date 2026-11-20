# Native asset specs v0 — freeze

**Date:** 2026-09-16 (updated for cadombrep / B3′; progress note 2026-11-20)  
**Status:** frozen gate lifted. On `develop`, graph SDK O4 and kernel writers K3-7/K3-8 have shipped. `main` does not include them past O2-5 (PR #80).

## Checklist

| Format | Spec | Proto | Fixture | Issue |
|--------|------|-------|---------|-------|
| `.cadom` | [cadom-v0.1.md](cadom-v0.1.md) (v0.3.3+) | [cadom.proto](../../packages/cadom-proto/cadom.proto) | [fixtures/cadom/](../../fixtures/cadom/) (binary, O4-2) | prior sprint |
| `.cadomesh` | [cadomesh-v0.md](cadomesh-v0.md) | [cadomesh.proto](../../packages/cadomesh-proto/cadomesh.proto) | [example-triangle](../../fixtures/cadomesh/example-triangle.md) (prose; bytes from kernel writer) | #31 |
| `.cadompart` | [cadompart-v0.md](cadompart-v0.md) (**v0.3**) | [cadompart.proto](../../packages/cadompart-proto/cadompart.proto) | [example-extruded-plate](../../fixtures/cadompart/example-extruded-plate.md) | #43 / #45 |
| `.cadombrep` | [cadombrep-v0.md](cadombrep-v0.md) (**v0 stub**) | [cadombrep.proto](../../packages/cadombrep-proto/cadombrep.proto) | kernel golden only (no `fixtures/` file) | #55 |
| `.cadomat` | [cadomat-v0.md](cadomat-v0.md) | [cadomat.proto](../../packages/cadomat-proto/cadomat.proto) | [example-red-metal](../../fixtures/cadomat/example-red-metal.md) | #33 |
| `.cadometa` | [cadometa-v0.md](cadometa-v0.md) | [cadometa.proto](../../packages/cadometa-proto/cadometa.proto) | [example-part-attrs](../../fixtures/cadometa/example-part-attrs.md) | #34 |

## Gate

The **spec-complete gate** documented in [sprint-native-assets.md](../sprint-native-assets.md) is **lifted**. The TypeScript graph SDK sprint has landed on `develop` as `@opencad/cadom` (O4-1…O4-3).

## Landed since the freeze (develop)

- `@opencad/cadom`: decode/encode, overrides, pass-through, binary `.cadom` fixtures, late-load, writer lint
- `@opencad/kernel`: Required v0 badge and Complete export v0 (`.cadomesh` + `.cadombrep` writers)

## Specified after the freeze (#97)

Not part of the v0 gate. Drafts: [cadomfab-v0.md](cadomfab-v0.md), [cadomctrl-v0.md](cadomctrl-v0.md). Markdown fixtures only. The graph SDK does not expose the new kinds yet.

## Still deferred

- Richer cadomesh (LOD, compression, skinning, tessellation provenance P0-K.4)
- Native analytic B-Rep inside `.cadombrep` (`OPENCAD_NATIVE` encoding)
- Full edge-id stability for fillet/chamfer (documented limitation in cadompart)
- Decoding `.cadompart` bytes inside the kernel (history DTO + goldens only today)
- Additional industrial features (loft, sweep, helix, shells, patterns of faces, …)
- Additional KHR material extensions in cadomat
- PLM ontology for cadometa keys
- Checked-in binary `.cadomesh` / `.cadombrep` fixtures (writers exist; `fixtures/` still has prose examples for those companions)
