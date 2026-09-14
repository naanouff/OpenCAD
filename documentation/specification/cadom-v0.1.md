# CADOM Specification v0.1

**Status:** draft  
**File extension:** `.cadom`  
**Serialization:** Protocol Buffers (normative schema TBD — SPEC-09)  
**Language:** English (normative)

## Conventions

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

| Keyword | Meaning |
|---------|---------|
| **MUST** / **REQUIRED** / **SHALL** | Absolute requirement |
| **MUST NOT** / **SHALL NOT** | Absolute prohibition |
| **SHOULD** / **RECOMMENDED** | There may be valid reasons to ignore, but the full implications must be understood |
| **SHOULD NOT** | Discouraged; valid exceptions exist with care |
| **MAY** / **OPTIONAL** | Truly optional |

### Document rules

- Normative specification text **MUST** be written in **English**.
- Non-normative notes **MAY** appear in English and **MUST** be marked *Informative* (or placed under an Informative section).
- Project process docs (contribution rules, sprint notes) **MAY** remain in French; they are not part of the format contract.
- Keywords above **MUST** appear in uppercase when used with normative force.
- Examples, diagrams, and rationales are *Informative* unless explicitly labeled normative.

### Glossary (initial)

| Term | Definition |
|------|------------|
| **CADOM** | CAD Object Model — assembly orchestration document / format |
| **Node** | Flat-list entry in the assembly DAG, identified by UUID |
| **Asset** | External geometry reference (e.g. STEP, glTF, GLB) |
| **Override** | Non-destructive patch applied to a node via a named layer |
| **Extension** | Vendor payload (`vendor` + `type` + opaque `bytes`) preserved on round-trip |
| **Pass-through** | Preserve and rewrite unknown extension bytes unchanged |
| **Late tessellation** | Load the graph first; fetch / tessellate geometry asynchronously |

## Table of contents

1. [Introduction](#1-introduction) — SPEC-02
2. [Units, axes, and transforms](#2-units-axes-and-transforms) — SPEC-03
3. [Flat node model (UUID DAG)](#3-flat-node-model-uuid-dag) — SPEC-04
4. [External assets](#4-external-assets) — SPEC-05
5. [Non-destructive overrides](#5-non-destructive-overrides) — SPEC-06
6. [Pass-through extensions](#6-pass-through-extensions) — SPEC-07
7. [Versioning and compatibility](#7-versioning-and-compatibility) — SPEC-08
8. [Normative Protobuf schema](#8-normative-protobuf-schema) — SPEC-09
9. [Examples](#9-examples) — SPEC-10
10. [Informative: w3dts mapping](#10-informative-w3dts-mapping)

---

## 1. Introduction

### 1.1 Identity

**CADOM** (CAD Object Model) is a web-native **assembly orchestration** format.

A CADOM document:

- Describes an assembly as a **flat directed acyclic graph (DAG)** of nodes identified by UUIDs.
- References **external geometry** assets (for example STEP, glTF, or GLB).
- Carries **metadata**, **non-destructive overrides**, and **vendor extensions**.
- Is serialized as a **binary Protocol Buffers** payload.

The conventional file extension for a CADOM document **MUST** be `.cadom`.

CADOM **MUST NOT** be treated as a boundary-representation (B-Rep) or NURBS geometry kernel. Exact solid/surface mathematics **MUST** remain in external files or systems; CADOM orchestrates structure and metadata around them.

### 1.2 Goals

A conforming CADOM implementation **SHOULD** support the following goals:

1. **Interoperability** — Strongly typed, multi-language serialization via Protocol Buffers so CAD, web, and tooling stacks can exchange the same assembly description.
2. **Scalable structure** — Represent large assemblies as a flat UUID-addressed DAG to avoid deep recursive nesting in the on-disk form and to allow O(1) node lookup after deserialize.
3. **Web-native consumption** — Expose transforms in a layout suitable for direct use by WebGL/WebGPU clients (column-major 4×4 matrices; see §2).
4. **Late tessellation / lazy loading** — Allow consumers to load and traverse the assembly graph before asynchronously resolving external geometry.
5. **Non-destructive editing** — Express presentation and placement changes as **overrides** layered on source nodes without mutating referenced geometry files.
6. **Lossless extensibility** — Allow vendors to attach opaque extension payloads that unknown readers **MUST** preserve and rewrite unchanged (**pass-through**).

### 1.3 Non-goals

The following are **out of scope** for CADOM v0.1 (and **MUST NOT** be required of a v0.1-conformant reader or writer):

1. **Exact geometry definition** — Embedding or defining B-Rep, NURBS, or mesh tessellation payloads as the primary geometry model inside `.cadom`.
2. **Tessellation algorithms** — How STEP (or other CAD) data is converted to triangles; that remains the responsibility of the consumer or a dedicated pipeline (for example a future w3dts-based validator).
3. **Multi-file archive container** — A zip-like packaging of `.cadom` plus assets as a single compound file (may be specified in a later revision).
4. **Authoring UI or viewer runtime** — Application chrome, ECS engines, or renderers; CADOM is a document format and data contract only.
5. **Parametric feature history** — CAD feature trees, sketches, or rebuild recipes.

### 1.4 Informative comparison

*Informative.* CADOM is intentionally narrower than general 3D scene or film pipelines:

| Format | Primary focus | Relation to CADOM |
|--------|---------------|-------------------|
| **glTF** | Runtime mesh/scene delivery for real-time engines | CADOM **MAY** reference glTF/GLB as an **Asset**; CADOM does not replace glTF’s mesh/material model. |
| **USD** | Broad composed scenes, layers, and film/VFX pipelines | CADOM shares the idea of non-destructive layering but targets **CAD assembly orchestration** with Protobuf and external STEP/glTF, not a full USD-compatible scene graph. |
| **STEP (ISO 10303)** | Exact product geometry and manufacturing data | CADOM **MAY** reference STEP files as assets; it does not redefine STEP semantics. |

CADOM’s role is the **assembly graph + metadata + overrides + extensions** layer that binds those external standards for web and tooling workflows.


## 2. Units, axes, and transforms

_TBD — SPEC-03_

Default units: metres. Up-axis: Y-up. `local_transform`: column-major mat4, 16 × float32 (gl-matrix / w3dts layout).

## 3. Flat node model (UUID DAG)

_TBD — SPEC-04_

Flat list of nodes addressed by UUID; children reconstructed via parent map (O(1)).

## 4. External assets

_TBD — SPEC-05_

References to STEP / glTF / GLB (and OTHER). Lazy geometry loading; graph loads first.

## 5. Non-destructive overrides

_TBD — SPEC-06_

Layered patches (visibility, material, optional transform) without mutating source nodes.

## 6. Pass-through extensions

_TBD — SPEC-07_

Opaque `vendor` + `type` + `payload` bytes; unknown extensions MUST round-trip unchanged.

## 7. Versioning and compatibility

_TBD — SPEC-08_

## 8. Normative Protobuf schema

_TBD — SPEC-09_

## 9. Examples

_TBD — SPEC-10_

## 10. Informative: w3dts mapping

_TBD — notes for future adapter (`TransformComponent`, `SceneNode`). Not normative for the format itself.

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.1-draft | 2026-09-14 | Scaffold TOC only |
| 0.1-draft | 2026-09-14 | Conventions: English + RFC 2119; initial glossary (SPEC-01) |
| 0.1-draft | 2026-09-14 | §1 Introduction: identity, goals, non-goals (SPEC-02) |
