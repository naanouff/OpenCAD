# OpenCAD Kernel — specification stub v0

**Status:** draft stub (K3-0)  
**Doctrine:** [`../opencad-doctrine.md`](../opencad-doctrine.md)  
**Backlog:** [`../sprint-kernel-k3.md`](../sprint-kernel-k3.md)  
**Issue:** [#57](https://github.com/naanouff/OpenCAD/issues/57)

## 1. Purpose

The **OpenCAD Kernel** rebuilds Required `.cadompart` features into an exact solid at runtime, tessellates to `.cadomesh`, and (Complete) exports dead `.cadombrep`.

This stub defines identity, non-goals, and the **K3-1** implementation base. Normative API and goldens follow in K3-2…K3-8.

## 2. Identity

| Item | Value |
|------|--------|
| Product name | OpenCAD Kernel |
| Contract | OpenCAD’s — not “bring your own OCCT” |
| Bootstrap implementation | [`@naanouff/occt-wasm`](https://github.com/naanouff/occt-wasm) artefact **`occt-kernel`** |
| History / parameters | Stay in `.cadompart` (and host Session); kernel ops are ephemeral |

## 3. K3-1 — Implementation base and licence

**Decision (2026-10-11):** bootstrap on **occt-kernel** (OCCT via Emscripten).

| Topic | Choice |
|-------|--------|
| Geometry engine | Open CASCADE Technology (OCCT) |
| Distribution | WASM module `occt-kernel` from `occt-wasm` |
| OCCT licence | **LGPL-2.1** (OCCT) — product integrators **MUST** meet LGPL obligations for the linked OCCT binary |
| OpenCAD specs / protos / this stub | **MIT** (repo OpenCAD) |
| Alternative engines | Best-effort only; not Required conformance |

Rationale: OpenCadEditor already ships the bootstrap; O2 will extract the editor pipeline (historique → wires → `runBatch`) into an OpenCAD package that consumes the same artefact.

## 4. Required rebuild scope (first badge)

Sketch (base constraints) + extrude, revolve, hole, boolean — see cadompart §11.2 and K3-3…K3-5.

## 5. Non-goals (v0)

- Full industrial feature catalogue
- Native analytic `OPENCAD_NATIVE` B-Rep encoding (bootstrap `OCCT_BREP` OK for cadombrep)
- STEP as truth
- Assembly mates solver
- Expression evaluation **inside** the kernel binary (dialect is host / cadompart; see [`cadompart-expression-v0.md`](cadompart-expression-v0.md))

## 6. Outbound writers (later)

| Writer | Backlog |
|--------|---------|
| `.cadomesh` | K3-7 |
| `.cadombrep` | K3-8 |
