# CADOM Specifications

This directory is the **source of truth** for the CADOM format specification.

| Document | Status | Description |
|----------|--------|-------------|
| [cadom-v0.1.md](cadom-v0.1.md) | **Draft frozen** | Normative specification v0.1 |
| [v0.1-freeze.md](v0.1-freeze.md) | Freeze record | Consistency checklist + deferred items |

## Writing conventions

- **Language:** English for all normative specification text.
- **Keywords:** RFC 2119 — `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY` (see [cadom-v0.1.md](cadom-v0.1.md#conventions)).
- Spec changes go through an issue + `feature/…` branch + PR into `develop`.
- The normative Protobuf schema is [`packages/cadom-proto/cadom.proto`](../../packages/cadom-proto/cadom.proto) (see §8 of the spec).
- Documented examples / fixtures: see `fixtures/` (SPEC-10).

## Sprint

Backlog: [../sprint-spec-tickets.md](../sprint-spec-tickets.md)  
Milestone: [Sprint Spec CADOM v0.1](https://github.com/naanouff/OpenCAD/milestone/1)
