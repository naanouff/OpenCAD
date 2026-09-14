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

_TBD — SPEC-02_

Identity, goals, non-goals. CADOM orchestrates assemblies; it does not define B-Rep/NURBS geometry.

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
