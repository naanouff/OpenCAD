# CADOM Specifications

This directory is the **source of truth** for CADOM wire formats. Product doctrine (B3 + K3, no STEP-as-truth): [`../opencad-doctrine.md`](../opencad-doctrine.md).

| Document | Status | Description |
|----------|--------|-------------|
| [cadom-v0.1.md](cadom-v0.1.md) | **v0.3.2 draft** | Normative core (filename historical; `version_minor = 5`) |
| [v0.3.2-amendment.md](v0.3.2-amendment.md) | Amendment | Doctrine B3+K3; STEP/`EXACT` out of truth model |
| [v0.3.1-amendment.md](v0.3.1-amendment.md) | Amendment | SWOT hygiene (superseded in part by v0.3.2) |
| [v0.3-amendment.md](v0.3-amendment.md) | Amendment | Multi-asset bindings + cadometa |
| [v0.2-amendment.md](v0.2-amendment.md) | Amendment | Native cadomesh / cadompart / cadomat |
| [v0.1-freeze.md](v0.1-freeze.md) | Frozen record | v0.1 freeze checklist |
| [cadomesh-v0.md](cadomesh-v0.md) | **v0 draft** | Tessellated mesh companion (`MESH`) |
| [cadomat-v0.md](cadomat-v0.md) | **v0 draft** | PBR material (Khronos / glTF MR) |
| [cadompart-v0.md](cadompart-v0.md) | **v0.2.2 draft** | Parametric + OpenCAD Kernel Required |
| [cadometa-v0.md](cadometa-v0.md) | **v0 draft** | Metadata companion |
| [native-assets-v0-freeze.md](native-assets-v0-freeze.md) | **Frozen** | Gate lifted — SDK allowed |

Process: [../opencad-doctrine.md](../opencad-doctrine.md), [../sprint-kernel-k3.md](../sprint-kernel-k3.md), [../cadom-spec-swot.md](../cadom-spec-swot.md) (SWOT-2).

## Writing conventions

- **Language:** English for all normative specification text.
- **Keywords:** RFC 2119 — `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `MAY` (see [cadom-v0.1.md](cadom-v0.1.md#conventions)).
- Spec changes go through an issue + `feature/…` branch + PR into `develop`.
- The normative Protobuf schema is [`packages/cadom-proto/cadom.proto`](../../packages/cadom-proto/cadom.proto) (package name `cadom.v0_1` frozen; see §8).

## Identity (fil rouge)

> OpenCAD carries orchestration (`.cadom`) and parametric rebuild (`.cadompart`) on the **OpenCAD Kernel** as co-primary. Viz without kernel = **cadomesh**. STEP is outside the OpenCAD truth model.
