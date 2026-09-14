# CADOM Specification v0.1

**Status:** draft  
**File extension:** `.cadom`  
**Serialization:** Protocol Buffers (normative schema TBD — SPEC-09)

> Sections below are stubs filled during the Sprint Spec. Normative language (MUST / SHOULD / MAY vs FR equivalents) is decided in SPEC-01.

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
