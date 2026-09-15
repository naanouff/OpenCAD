# Native asset specs v0 — freeze

**Date:** 2026-09-14  
**Status:** frozen — SDK development is now allowed

## Checklist

| Format | Spec | Proto | Fixture | Issue |
|--------|------|-------|---------|-------|
| `.cadom` | [cadom-v0.1.md](cadom-v0.1.md) (v0.3+) | [cadom.proto](../../packages/cadom-proto/cadom.proto) | [fixtures/](../../fixtures/) | prior sprint |
| `.cadomesh` | [cadomesh-v0.md](cadomesh-v0.md) | [cadomesh.proto](../../packages/cadomesh-proto/cadomesh.proto) | [example-triangle](../../fixtures/cadomesh/example-triangle.md) | #31 |
| `.cadompart` | [cadompart-v0.md](cadompart-v0.md) (**v0.1**) | [cadompart.proto](../../packages/cadompart-proto/cadompart.proto) | [example-extruded-plate](../../fixtures/cadompart/example-extruded-plate.md) | #32 / #43 |
| `.cadomat` | [cadomat-v0.md](cadomat-v0.md) | [cadomat.proto](../../packages/cadomat-proto/cadomat.proto) | [example-red-metal](../../fixtures/cadomat/example-red-metal.md) | #33 |
| `.cadometa` | [cadometa-v0.md](cadometa-v0.md) | [cadometa.proto](../../packages/cadometa-proto/cadometa.proto) | [example-part-attrs](../../fixtures/cadometa/example-part-attrs.md) | #34 |

## Gate

The **spec-complete gate** documented in [sprint-native-assets.md](../sprint-native-assets.md) is **lifted**.

Contributors **MAY** start the TypeScript SDK sprint under the usual rules: feature branches, TDD, DRY/KISS/YAGNI, PRs into `develop`.

## Still deferred (not blocking SDK graph work)

- Richer cadomesh (LOD, compression, skinning)
- Full edge-id stability for fillet/chamfer across kernels (documented limitation in cadompart v0.1)
- Additional industrial features (loft, sweep, shells, patterns of faces, …)
- Additional KHR material extensions in cadomat
- PLM ontology for cadometa keys
- Binary fixture `.cadom` / companion files (produced by SDK)
- Conforming rebuild engine implementation (separate sprint)
