# OpenCAD / CADOM

Open-source **CAD platform**: assembly orchestration (**CADOM**) + parametric rebuild on the **OpenCAD B-Rep kernel**, released under the [MIT License](LICENSE).

Doctrine (binding for product direction): [`documentation/opencad-doctrine.md`](documentation/opencad-doctrine.md)

| Capability | Truth |
|------------|--------|
| Assembly graph | `.cadom` |
| Design intent | `.cadompart` |
| Exact solid (runtime) | **OpenCAD Kernel** (rebuild) |
| Exact solid (dead / metrology) | `.cadombrep` |
| Viz without kernel | `.cadomesh` |
| Nominal manufacturing | `.cadomfab` |
| Control adjustments | `.cadomctrl` (overrides gamme parameters; does not edit the gamme) |
| STEP / AP242 | **Out of** the OpenCAD truth model |

## Status

- **Doctrine:** B · **B3′** (viz = mesh; dead exact = cadombrep) · K3 (product kernel) — [#51](https://github.com/naanouff/OpenCAD/issues/51), [#55](https://github.com/naanouff/OpenCAD/issues/55)
- **CADOM Spec:** **v0.3.5** — [`documentation/specification/cadom-v0.1.md`](documentation/specification/cadom-v0.1.md) (filename historical); package `cadom.v0_1` frozen; `version_minor = 7` when emitting fab/ctrl ([#97](https://github.com/naanouff/OpenCAD/issues/97))
- **Manufacturing / Control:** `.cadomfab` + `.cadomctrl` v0 specs. Wire defined; `@opencad/cadom` unions still at v0.3.3. No removal simulator yet
- **cadombrep:** stub v0 — [`documentation/specification/cadombrep-v0.md`](documentation/specification/cadombrep-v0.md)
- **cadompart:** **v0.3** — expression dialect `opencad.expr.v0` ([#57](https://github.com/naanouff/OpenCAD/issues/57))
- **Kernel:** `@opencad/kernel` on `develop` (K3-2…K3-8, O2-1…O2-15) — Required v0 + Complete export v0 — [`packages/kernel`](packages/kernel); spec [`documentation/specification/opencad-kernel-v0.md`](documentation/specification/opencad-kernel-v0.md)
- **CADOM SDK:** `@opencad/cadom` on `develop` (O4-1…O4-3: decode/encode, fixtures, late-load, adapter resolve, writer lint) — [`packages/cadom`](packages/cadom)
- **Release:** `main` last synced at PR #80 (through O2-5). O2-6…O2-15 and O4 are on `develop` only
- **Next:** helix (W1, occt-wasm); cadomesh tessellation provenance (P0-K.4); P1 assembly (`.cadomz`, occurrences); release PR `develop` → `main`
- Process: [SWOT-2 (current)](documentation/cadom-spec-swot.md) · [remediation](documentation/sprint-swot-remediation.md)

## Goals

- **Protobuf** serialization — strong typing, fast parse, multi-language
- **Flat UUID DAG** — scalable assemblies without deep recursion
- **TypeScript + `Float32Array`** — WebGL/WebGPU-friendly transforms
- **Late loading** — graph first; fetch mesh / parametric / exact asynchronously
- **OpenCAD Kernel** — Required rebuild (sketch + extrude/revolve/hole/boolean) under TDD
- **Dead exact** — `.cadombrep` for metrology / archive
- **Non-destructive overrides** — including `default_active_layers`
- **Pass-through extensions** — unknown vendor payloads preserved on round-trip

## File extension

`.cadom` — binary Protocol Buffers (`application/vnd.opencad.cadom`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [documentation/contribution-rules.md](documentation/contribution-rules.md).

Summary: no direct commits on `main` / `develop`; work on `feature/*` or `fix/*`; PR into `develop`; release via PR `develop` → `main`. Commits are atomic and linked to an issue (message + description). Issues must state **DOR** and **DOD**. When coding: **TDD** mandatory; **DRY**, **KISS**, **YAGNI**.

## License

[MIT](LICENSE) — free to use, modify, and redistribute, including commercially.
