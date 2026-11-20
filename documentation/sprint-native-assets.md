# Sprint — Native asset specs v0

Milestone: [Sprint Native Asset Specs v0](https://github.com/naanouff/OpenCAD/milestone/2)

## Gate status: LIFTED

All required initial v0 specs are published. See [specification/native-assets-v0-freeze.md](specification/native-assets-v0-freeze.md).

**SDK work is allowed and, on `develop`, landed** (`@opencad/cadom`, O4-1…O4-3).

| Format | Spec doc | Issue |
|--------|----------|-------|
| `.cadom` | [cadom-v0.1.md](specification/cadom-v0.1.md) (v0.3+) | done |
| `.cadomesh` | [cadomesh-v0.md](specification/cadomesh-v0.md) | [#31](https://github.com/naanouff/OpenCAD/issues/31) — done |
| `.cadompart` | [cadompart-v0.md](specification/cadompart-v0.md) (**v0.3**) | [#45](https://github.com/naanouff/OpenCAD/issues/45) — done |
| `.cadomat` | [cadomat-v0.md](specification/cadomat-v0.md) | [#33](https://github.com/naanouff/OpenCAD/issues/33) — done |
| `.cadometa` | [cadometa-v0.md](specification/cadometa-v0.md) | [#34](https://github.com/naanouff/OpenCAD/issues/34) — done |

## Landed after the gate

`@opencad/cadom` on `develop` (O4-1…O4-3): `decode` / `encode`, flat UUID document, non-destructive overrides, extension pass-through, binary fixtures under `fixtures/cadom/`, late-load plan, adapter resolve, writer lint (`lintWriterTruth`). See [`packages/cadom/README.md`](../packages/cadom/README.md).

`@opencad/kernel` on `develop`: Required v0 and Complete export v0 (K3-3…K3-8) plus history compiler O2-1…O2-15. See [`packages/kernel/README.md`](../packages/kernel/README.md).

## Still open

- Tessellation provenance on `.cadomesh` (P0-K.4: `kernel_id`, version, source hash) — proto has no such fields
- Helix (W1, occt-wasm) and the rest of the Recommended catalogue
- P1 assembly: `.cadomz`, occurrence PLM, mates
- Release: `main` stops at PR #80 (O2-5). O2-6…O2-15 and O4 are `develop` only
- Kernel does not decode `.cadompart` bytes (history DTO + goldens only)
