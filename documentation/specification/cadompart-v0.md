# CADOMPART Specification v0.1

**Status:** draft (v0.1) — supersedes v0.0 “parameter bag”  
**File extension:** `.cadompart`  
**Serialization:** Protocol Buffers — [`packages/cadompart-proto/cadompart.proto`](../../packages/cadompart-proto/cadompart.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMPART` / role `PARAMETRIC`

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## 1. Purpose and ambition

CADOMPART is the CADOM-native **parametric part definition** format for modern industrial interchange.

It **MUST** provide:

1. An ordered **feature history** with a **normative vocabulary** of operations;
2. Typed **parameters** that drive those operations;
3. Enough semantics that a **conforming rebuild engine** can reconstruct the intended solid from the file alone (for features defined in this revision).

CADOMPART is **not**:

- the assembly occurrence graph (`.cadom`);
- display tessellation (`.cadomesh`) — though tools **SHOULD** refresh mesh assets after rebuild;
- a proprietary kernel binary (Parasolid/ACIS dump). Exact B-Rep **MAY** also be published alongside as STEP for downstream consumers that do not rebuild.

### 1.1 Design stance

CADOM does not ship a geometry kernel in the format itself. It **standardizes the recipe**. Any conforming modeller / open kernel binding (OpenCascade, etc.) **MUST** interpret the normative features in this document the same way.

## 2. File layout

The entire `.cadompart` file body **MUST** be a single serialized `cadompart.v0_1.CadompartFile` message.

Writers producing this revision **MUST** set `version_major = 0` and `version_minor = 1`.

Readers that only implement v0.0 parameter bags **MUST** reject or explicitly open-in-compatibility-mode files with `version_minor >= 1` that contain typed feature bodies.

## 3. Units and axes

- If `units` is `UNSPECIFIED`, readers **MUST** assume **metres**.
- If `up_axis` is `UNSPECIFIED`, readers **MUST** assume **Y-up**.
- Linear quantities in feature payloads (distances, radii, positions) **MUST** be expressed in the file’s length unit.
- Angles in feature payloads **MUST** be in **radians**.

## 4. Parameters

Parameters remain a first-class table for UI, configurations, and expressions.

| Field | Rule |
|-------|------|
| `id` | Non-empty; unique within the file |
| `type` | **MUST NOT** be `UNSPECIFIED` when written |
| value fields | **SHOULD** match `type` (see v0.0 table: FLOAT/INT/BOOL/STRING/VEC3) |
| `expression` | Optional unevaluated authoring string; engines **MAY** support a future expression dialect |

Duplicate parameter `id` **MUST** be rejected.

Features **MAY** list `parameter_ids` they depend on for tooling; the geometric payload fields remain authoritative for rebuild unless a future revision defines binding rules from parameters → fields.

## 5. Feature history

`features` is an **ordered** list. Index `0` is applied first. Each entry **MUST** set exactly one `body` oneof.

- `suppressed = true` **MUST** skip the feature during rebuild while retaining it for round-trip.
- Unknown future `oneof` variants **MUST** be preserved on round-trip when the runtime allows; a v0.1 engine that does not understand them **MUST** fail rebuild with an explicit unsupported-feature error (not silent skip), unless `suppressed`.

Duplicate feature `id` **MUST** be rejected.

### 5.1 Rebuild result model (normative intent)

A conforming rebuild **MUST** maintain a current solid body (possibly empty at start). Features mutate that body according to §§6–7. Edge ids referenced by fillet/chamfer are **implementation-defined labels** produced by the engine for prior geometry; files that rely on edge ids **SHOULD** also ship a companion STEP or document edge mapping — v0.1 edge identity is best-effort across kernels (**known limitation**).

## 6. Normative feature vocabulary (v0.1)

### 6.1 `sketch`

Defines a 2D profile in a plane:

- `origin`, `x_axis`, `y_axis` — plane in part space (`x_axis` × `y_axis` **SHOULD** be unit and orthogonal; readers **MAY** orthonormalize);
- `curves` — lines, circles, arcs;
- `outer_loop` — indices into `curves` for the outer boundary; if empty, curves **MUST** be interpreted in list order as one outer loop.

Inner loops / holes in sketch **are not** in v0.1 (use separate cut features).

### 6.2 `extrude`

- `profile_sketch_id` **MUST** refer to a prior `sketch` feature.
- `distance` **MUST** be > 0.
- If `direction` is zero-length, use the sketch plane normal (`x_axis` × `y_axis`).
- `symmetric` extrudes ± distance/2 along direction.
- `cut = false` adds material (union with current body, or creates body if empty).
- `cut = true` subtracts from current body (**MUST** fail if body empty).

### 6.3 `revolve`

- Profile sketch + axis (`axis_origin`, `axis_direction` non-zero) + `angle_rad` in `(0, 2π]`.
- `cut` as for extrude.

### 6.4 `hole`

- `position` + `axis` (non-zero) + `diameter` > 0 + `depth`.
- `hole_type` selects simple / counterbore / countersink; counterbore/sink dimensions **MUST** be set when type requires them.
- Applied as subtractive geometry on the current body.

### 6.5 `fillet` / `chamfer`

- `edge_ids` select target edges; `radius` / `distance` **MUST** be > 0.
- If `edge_ids` is empty, behaviour is application-defined and **MUST NOT** be relied on for interchange.

### 6.6 `boolean`

- `op`: union / subtract / intersect.
- `tool_feature_id` **MUST** refer to a prior feature whose solid contribution is the tool body (engines **MUST** define how feature solids are retained for boolean tools).

### 6.7 `pattern_linear` / `pattern_circular`

- Instance a prior feature’s contribution `count` times along a direction or about an axis.
- `count` **MUST** be ≥ 1; for patterns that include the source, engines **MUST** document whether the source is duplicated or count includes the original — **v0.1 rule:** `count` is the **total** number of instances including the source.

## 7. Conformance tiers

| Tier | Requirement |
|------|-------------|
| **Reader (round-trip)** | Preserve all fields/features; validate ids and oneof presence |
| **Rebuild engine (conformant)** | Implement sketch, extrude, revolve, hole, boolean; fillet/chamfer/patterns **SHOULD** be implemented; unsupported non-suppressed features → explicit error |
| **Authoring exporter** | Emit ordered history using only normative kinds above (or mark experimental extensions via CADOM `Extension` on the assembly, not inside cadompart v0.1) |

## 8. Binding to CADOM

A part occurrence **SHOULD** bind:

| Role | Asset |
|------|--------|
| `PARAMETRIC` | this `.cadompart` |
| `MESH` | tessellation derived from rebuild (`.cadomesh`) and/or |
| exact | `STEP` asset for consumers that skip rebuild |

## 9. Relation to v0.0

v0.0 defined only a parameter bag + opaque feature stubs. That model is **insufficient** for industrial rebuild interchange and is **superseded** by v0.1. Tools **MAY** still read v0.0 (`version_minor = 0`) as parameters-only.

## 10. Example

*Informative.* See [`fixtures/cadompart/example-extruded-plate.md`](../../fixtures/cadompart/example-extruded-plate.md).

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Parameter bag + opaque stubs (superseded) |
| 0.1 | 2026-09-15 | Normative feature history + rebuild ambition (option A) (#43) |
