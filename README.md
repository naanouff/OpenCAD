# OpenCAD / CADOM

Open-source **CAD platform**: assembly orchestration (**CADOM**) + parametric rebuild on the **OpenCAD B-Rep kernel**, released under the [MIT License](LICENSE).

Doctrine (binding for product direction): [`documentation/opencad-doctrine.md`](documentation/opencad-doctrine.md)

| Capability | Truth |
|------------|--------|
| Assembly graph | `.cadom` |
| Design intent | `.cadompart` |
| Exact solid | **OpenCAD Kernel** (rebuild) |
| Viz without kernel | `.cadomesh` |
| STEP / AP242 | **Out of** the OpenCAD truth model |

## Status

- **Doctrine:** B (orchestration + rebuild co-primary) · B3 (viz = mesh) · K3 (product kernel) — [#51](https://github.com/naanouff/OpenCAD/issues/51)
- **CADOM Spec:** **v0.3.2** — [`documentation/specification/cadom-v0.1.md`](documentation/specification/cadom-v0.1.md) (filename historical); package `cadom.v0_1` frozen
- **cadompart:** v0.2 catalogue + **v0.2.2** doctrine alignment (Required étroit, TDD)
- **Kernel:** backlog [`documentation/sprint-kernel-k3.md`](documentation/sprint-kernel-k3.md)
- **Next:** graph SDK (TDD) in parallel with kernel Required badge; writers use `PARAMETRIC` + `MESH` (not STEP/`EXACT`)
- Process: [SWOT-2 (current)](documentation/cadom-spec-swot.md) · [remediation](documentation/sprint-swot-remediation.md)

## Goals

- **Protobuf** serialization — strong typing, fast parse, multi-language
- **Flat UUID DAG** — scalable assemblies without deep recursion
- **TypeScript + `Float32Array`** — WebGL/WebGPU-friendly transforms
- **Late loading** — graph first; fetch mesh / parametric asynchronously
- **OpenCAD Kernel** — Required rebuild (sketch + extrude/revolve/hole/boolean) under TDD
- **Non-destructive overrides** — including `default_active_layers`
- **Pass-through extensions** — unknown vendor payloads preserved on round-trip

## File extension

`.cadom` — binary Protocol Buffers (`application/vnd.opencad.cadom`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [documentation/contribution-rules.md](documentation/contribution-rules.md).

Summary: no direct commits on `main` / `develop`; work on `feature/*` or `fix/*`; PR into `develop`; release via PR `develop` → `main`. Commits are atomic and linked to an issue (message + description). Issues must state **DOR** and **DOD**. When coding: **TDD** mandatory; **DRY**, **KISS**, **YAGNI**.

## License

[MIT](LICENSE) — free to use, modify, and redistribute, including commercially.
