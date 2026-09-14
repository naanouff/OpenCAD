# OpenCAD / CADOM

**CADOM** (CAD Object Model) is a light, web-native assembly orchestration format for CAD.

It does **not** reinvent B-Rep/NURBS. Geometry stays in external standards (STEP, glTF). CADOM focuses on assembly structure, metadata, non-destructive overrides, and pass-through extensions.

## Status

MVP A in progress: Protobuf schema + TypeScript SDK (read/write). Visual validation will use the w3dts engine later.

See [documentation/plan-mvp-a-cadom.md](documentation/plan-mvp-a-cadom.md) for the implementation plan.

## Goals

- **Protobuf** serialization — strong typing, fast parse, multi-language
- **Flat UUID DAG** — scalable assemblies without deep recursion
- **TypeScript + `Float32Array`** — direct WebGL/WebGPU-friendly transforms
- **Late tessellation** — load the graph first, fetch geometry asynchronously
- **Non-destructive overrides** — materials/visibility as layers over source nodes
- **Pass-through extensions** — unknown vendor payloads preserved on round-trip

## File extension

`.cadom` — binary Protocol Buffers document

## License

MIT (see [LICENSE](LICENSE))
