# CADOMESH Specification v0

**Status:** draft initial (v0)  
**File extension:** `.cadomesh`  
**Serialization:** Protocol Buffers — [`packages/cadomesh-proto/cadomesh.proto`](../../packages/cadomesh-proto/cadomesh.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMESH` / role `MESH`

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## 1. Purpose

CADOMESH is the CADOM-native **tessellated triangle mesh** format for display and GPU upload. It is the **kernel-free visualization** path in OpenCAD doctrine (B3′). It does **not** replace `.cadompart` intent, `.cadombrep` dead exact, or the OpenCAD Kernel, and it does not replace CADOM assembly structure (`.cadom`).

A Complete OpenCAD part occurrence typically binds:

- `MESH` → `.cadomesh` (this format) and/or glTF/GLB
- `PARAMETRIC` → `.cadompart` (rebuild via OpenCAD Kernel)
- `EXACT` → `.cadombrep` (dead B-Rep envelope)
- optionally `MATERIAL` / `METADATA` → other companion files

Supported length units when set on the mesh: `METRES`, `MILLIMETRES`, `INCHES` (aligned with CADOM assembly). `UNSPECIFIED` still means inherit from `.cadom`.

## 2. File layout

The entire `.cadomesh` file body **MUST** be a single serialized `cadomesh.v0.CadomeshFile` Protobuf message. No additional framing is defined in v0.

Writers producing v0 **MUST** set `version_major = 0` and `version_minor = 0`.

## 3. Coordinate system

- If `units` is `LENGTH_UNIT_UNSPECIFIED`, consumers **MUST** inherit length units from the referencing `.cadom` document.
- If `up_axis` is `UP_AXIS_UNSPECIFIED`, consumers **MUST** inherit up-axis from the referencing `.cadom` document.
- When set, `units` / `up_axis` **MUST** be interpreted as in the CADOM assembly spec (§2).
- Positions are in the mesh local space; the assembly node `local_transform` places the mesh in the assembly.

## 4. Geometry

### 4.1 Topology

v0 supports only `PRIMITIVE_TOPOLOGY_TRIANGLES`. Writers **MUST** set `topology` to `TRIANGLES`. Other values **MUST** cause rejection by a v0 reader.

### 4.2 Positions (required)

`positions` **MUST** contain tightly packed IEEE-754 binary32 values: `x0,y0,z0, x1,y1,z1, …`.

Let `vertex_count = len(positions) / 3`.

- `len(positions)` **MUST** be a multiple of 3 and **MUST** be > 0.
- All values **MUST** be finite.

### 4.3 Normals (optional)

If `normals` is non-empty:

- `len(normals)` **MUST** equal `len(positions)`.
- Values are packed XYZ float32, finite.
- Normals **SHOULD** be unit length; readers **MAY** renormalize.

### 4.4 UVs (optional)

If `uvs` is non-empty:

- `len(uvs)` **MUST** equal `2 * vertex_count`.
- Values are packed `u,v` float32.

### 4.5 Indices

**Indexed mode** — `indices` non-empty:

- `len(indices)` **MUST** be a multiple of 3.
- Each index **MUST** be `< vertex_count`.
- Triangles are consecutive triplets `(i0,i1,i2)`.

**Non-indexed mode** — `indices` empty:

- `vertex_count` **MUST** be a multiple of 3.
- Consecutive vertex triplets form triangles.

Winding order **SHOULD** be counter-clockwise when viewed from the outside along the inherited/document up-axis convention (right-handed). Readers **MUST NOT** reject opposite winding; materials/double-sided policy is outside this file.

## 5. GPU mapping (informative)

*Informative.* Consumers **MAY** upload separate buffers or interleave P/N/UV into a single `Float32Array` for WebGL/WebGPU. Prefer preserving the source arrays when encoding to avoid precision churn.

## 6. Validation summary

A v0 reader **MUST** reject a file that violates any MUST in §§2–4 (including empty positions, wrong attribute lengths, non-triangle topology, out-of-range indices).

## 7. Normative schema

See [`packages/cadomesh-proto/cadomesh.proto`](../../packages/cadomesh-proto/cadomesh.proto).

## 8. Example (logical)

*Informative.* See [`fixtures/cadomesh/example-triangle.md`](../../fixtures/cadomesh/example-triangle.md).

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Initial draft (NATIVE-01) |
