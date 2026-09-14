# OpenCAD / CADOM

Open-source project. **CADOM** (CAD Object Model) is a light, web-native assembly orchestration format for CAD, released under the [MIT License](LICENSE).

It does **not** reinvent B-Rep/NURBS. Geometry stays in external standards (STEP, glTF). CADOM focuses on assembly structure, metadata, non-destructive overrides, and pass-through extensions.

## Status

- **CADOM Spec v0.1:** draft frozen — [documentation/specification/cadom-v0.1.md](documentation/specification/cadom-v0.1.md) ([freeze notes](documentation/specification/v0.1-freeze.md))
- **Next:** TypeScript SDK (read/write) with TDD. Visual validation later via w3dts.
- Implementation plan: [documentation/plan-mvp-a-cadom.md](documentation/plan-mvp-a-cadom.md)

## Goals

- **Protobuf** serialization — strong typing, fast parse, multi-language
- **Flat UUID DAG** — scalable assemblies without deep recursion
- **TypeScript + `Float32Array`** — direct WebGL/WebGPU-friendly transforms
- **Late tessellation** — load the graph first, fetch geometry asynchronously
- **Non-destructive overrides** — materials/visibility as layers over source nodes
- **Pass-through extensions** — unknown vendor payloads preserved on round-trip

## File extension

`.cadom` — binary Protocol Buffers document

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [documentation/contribution-rules.md](documentation/contribution-rules.md).

Summary: no direct commits on `main` / `develop`; work on `feature/*` or `fix/*`; PR into `develop`; release via PR `develop` → `main`. Commits are atomic and linked to an issue (message + description). Issues must state **DOR** and **DOD**. When coding: **TDD** mandatory; **DRY**, **KISS**, **YAGNI**.

## License

[MIT](LICENSE) — free to use, modify, and redistribute, including commercially.
