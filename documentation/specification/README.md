# CADOM Specifications

This directory is the **source of truth** for the CADOM format specification.

| Document | Status | Description |
|----------|--------|-------------|
| [cadom-v0.1.md](cadom-v0.1.md) | **v0.3 draft** | Normative specification (filename historical; content is v0.3) |
| [v0.1-freeze.md](v0.1-freeze.md) | Frozen record | v0.1 freeze checklist |
| [v0.2-amendment.md](v0.2-amendment.md) | Amendment | Native cadomesh / cadompart / cadomat |
| [cadomesh-v0.md](cadomesh-v0.md) | **v0 draft** | Tessellated mesh companion |
| [cadomat-v0.md](cadomat-v0.md) | **v0 draft** | PBR material (Khronos / glTF MR) |
| [cadompart-v0.md](cadompart-v0.md) | **v0 draft** | Parametric part definition |
| [cadometa-v0.md](cadometa-v0.md) | **v0 draft** | Metadata companion |
| [native-assets-v0-freeze.md](native-assets-v0-freeze.md) | **Frozen** | Gate lifted — SDK allowed |
| [v0.3-amendment.md](v0.3-amendment.md) | Amendment | Multi-asset bindings + cadometa |

## Writing conventions

- **Language:** English for all normative specification text.
- **Keywords:** RFC 2119 — `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY` (see [cadom-v0.1.md](cadom-v0.1.md#conventions)).
- Spec changes go through an issue + `feature/…` branch + PR into `develop`.
- The normative Protobuf schema is [`packages/cadom-proto/cadom.proto`](../../packages/cadom-proto/cadom.proto) (see §8 of the spec).
- Documented examples / fixtures: see `fixtures/` (SPEC-10).

## Sprint

Backlog: [../sprint-spec-tickets.md](../sprint-spec-tickets.md)  
Milestone: [Sprint Spec CADOM v0.1](https://github.com/naanouff/OpenCAD/milestone/1)
