# CADOM Specifications

This directory is the **source of truth** for the CADOM format specification.

| Document | Status | Description |
|----------|--------|-------------|
| [cadom-v0.1.md](cadom-v0.1.md) | **v0.3.1 draft** | Normative core (filename historical; `version_minor = 4`) |
| [v0.3.1-amendment.md](v0.3.1-amendment.md) | Amendment | SWOT hygiene: EXACT, mm, sibling order, layers, hash |
| [v0.3-amendment.md](v0.3-amendment.md) | Amendment | Multi-asset bindings + cadometa |
| [v0.2-amendment.md](v0.2-amendment.md) | Amendment | Native cadomesh / cadompart / cadomat |
| [v0.1-freeze.md](v0.1-freeze.md) | Frozen record | v0.1 freeze checklist |
| [cadomesh-v0.md](cadomesh-v0.md) | **v0 draft** | Tessellated mesh companion (`MESH`) |
| [cadomat-v0.md](cadomat-v0.md) | **v0 draft** | PBR material (Khronos / glTF MR) |
| [cadompart-v0.md](cadompart-v0.md) | **v0.2.1 draft** | Parametric catalogue + realism posture |
| [cadometa-v0.md](cadometa-v0.md) | **v0 draft** | Metadata companion |
| [native-assets-v0-freeze.md](native-assets-v0-freeze.md) | **Frozen** | Gate lifted — SDK allowed |

Non-normative process: [../cadom-spec-swot.md](../cadom-spec-swot.md), [../sprint-swot-remediation.md](../sprint-swot-remediation.md).

## Writing conventions

- **Language:** English for all normative specification text.
- **Keywords:** RFC 2119 — `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY` (see [cadom-v0.1.md](cadom-v0.1.md#conventions)).
- Spec changes go through an issue + `feature/…` branch + PR into `develop`.
- The normative Protobuf schema is [`packages/cadom-proto/cadom.proto`](../../packages/cadom-proto/cadom.proto) (package name `cadom.v0_1` frozen; see §8).
- Documented examples / fixtures: see `fixtures/` (SPEC-10).

## Identity (fil rouge)

A CADOM **product** = core graph + viz (`MESH`) + optional exact (`EXACT` / STEP) + meta. Parametric rebuild (`.cadompart`) is optional and **MUST NOT** be required for validity.
