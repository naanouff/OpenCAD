# OpenCAD / CADOM

Open-source project. **CADOM** (CAD Object Model) is a light, web-native **assembly orchestration** format for CAD (JT/3DXML niche), released under the [MIT License](LICENSE).

CADOM is **two layers**:

1. **Core** (`.cadom`) — flat UUID product graph, asset refs, overrides, extensions. Visualizable **without a geometry kernel**.
2. **Native family** (optional) — `.cadomesh`, `.cadomat`, `.cadometa`, `.cadompart`.

Exact solids stay in **STEP** (`EXACT`); display triangles in **cadomesh / glTF** (`MESH`). Parametric feature history (`.cadompart`) is optional enrichment, never required for a valid product.

## Status

- **CADOM Spec:** **v0.3.1** (hygiene / SWOT) — file [`documentation/specification/cadom-v0.1.md`](documentation/specification/cadom-v0.1.md) (filename historical); protobuf package `cadom.v0_1` frozen
- **Native assets:** v0 frozen — [freeze notes](documentation/specification/native-assets-v0-freeze.md)
- **cadompart:** v0.2 catalogue + **v0.2.1** realism posture (narrow Required; STEP/mesh = truth without rebuild)
- **Next:** TypeScript SDK (TDD) after v0.3.1 lands — decode/encode, overrides, pass-through; writers **SHOULD** use `EXACT` for STEP
- Process: [SWOT analysis](documentation/cadom-spec-swot.md) · [remediation backlog](documentation/sprint-swot-remediation.md)
- Plan: [documentation/plan-mvp-a-cadom.md](documentation/plan-mvp-a-cadom.md)

## Goals

- **Protobuf** serialization — strong typing, fast parse, multi-language
- **Flat UUID DAG** — scalable assemblies without deep recursion
- **TypeScript + `Float32Array`** — direct WebGL/WebGPU-friendly transforms (double authoring **SHOULD** where needed)
- **Late tessellation** — load the graph first, fetch geometry asynchronously
- **Non-destructive overrides** — materials/visibility as layers over source nodes
- **Pass-through extensions** — unknown vendor payloads preserved on round-trip

## File extension

`.cadom` — binary Protocol Buffers (`application/vnd.opencad.cadom`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [documentation/contribution-rules.md](documentation/contribution-rules.md).

Summary: no direct commits on `main` / `develop`; work on `feature/*` or `fix/*`; PR into `develop`; release via PR `develop` → `main`. Commits are atomic and linked to an issue (message + description). Issues must state **DOR** and **DOD**. When coding: **TDD** mandatory; **DRY**, **KISS**, **YAGNI**.

## License

[MIT](LICENSE) — free to use, modify, and redistribute, including commercially.
