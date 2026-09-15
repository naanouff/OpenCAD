# CADOMPART Specification v0.2

**Status:** draft (v0.2) — exhaustive industrial parametric part definition  
**File extension:** `.cadompart`  
**Serialization:** Protocol Buffers — [`packages/cadompart-proto/cadompart.proto`](../../packages/cadompart-proto/cadompart.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMPART` / role `PARAMETRIC`  
**Supersedes:** v0.0 (parameter bag), v0.1 (initial feature set)

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 1. Purpose

CADOMPART is the CADOM standard for **parametric solid part definition** aimed at modern industrial CAD interchange.

A `.cadompart` file **MUST** be sufficient for a **conforming rebuild engine** to reconstruct the design intent expressed by its **ordered feature history**, using the **normative vocabulary** in this document.

The mechanical CAD domain is mature: extrudes, revolves, holes, fillets, patterns, sketches with constraints, datums, and configurations are well-known. This revision specifies them **explicitly** rather than leaving opaque stubs.

### 1.1 In scope

- Parameters (typed, bounded, optional expressions)
- Datums (planes, axes, points, coordinate systems)
- 2D sketches (curves, loops, geometric & dimensional constraints)
- Solid modeling features listed in §8
- Linear/circular patterns, mirror
- Multi-body identifiers
- Design configurations (parameter overrides + suppressions)

### 1.2 Out of scope (this revision)

- Assembly mates (belong in `.cadom` / future assembly constraints doc)
- Full 3D PMI/GD&T presentation (use STEP AP242 PMI and/or future CADOM PMI extension)
- Freeform Class-A surfacing specialty tools
- Electrical/harness, PCB, and non-mechanical domains
- Shipping a geometry kernel binary with the format

### 1.3 Relation to other CADOM assets

| Asset | Role |
|-------|------|
| `.cadompart` | Authoritative **parametric recipe** |
| STEP | Optional **exact B-Rep snapshot** for non-rebuilding consumers |
| `.cadomesh` | Optional **tessellation** for runtime view |
| `.cadomat` / `.cadometa` | Appearance / metadata on the occurrence |

After rebuild, exporters **SHOULD** refresh STEP and/or `.cadomesh` so non-rebuild viewers stay consistent.

---

## 2. File layout and versioning

The file body **MUST** be one serialized `cadompart.v0_2.CadompartFile`.

Writers of this revision **MUST** set `version_major = 0` and `version_minor = 2`.

| Writer minor | Reader expectation |
|--------------|-------------------|
| 0 | Parameters + opaque stubs only (legacy) |
| 1 | v0.1 feature subset |
| 2 | This document |

A v0.2 conforming rebuild engine **MUST** implement all **Required** features in §11. It **SHOULD** implement all **Recommended** features. It **MUST** error explicitly on unsupported non-suppressed features.

---

## 3. Units, axes, and numeric conventions

| Field | Default if `UNSPECIFIED` |
|-------|--------------------------|
| `units` | metres |
| `up_axis` | Y-up |

- Lengths in feature payloads **MUST** use the document length unit.
- Angles **MUST** be stored in **radians**.
- Directions **MUST** be treated as vectors; engines **SHOULD** normalize non-zero directions; zero-length direction has feature-specific fallback (documented per feature).
- Right-handed coordinates are **REQUIRED**.

`Mat4` transforms **MUST** be column-major length 16 (same layout as CADOM assembly matrices).

---

## 4. Parameters

Parameters are the editable design variables.

### 4.1 Fields

| Field | Normative rule |
|-------|----------------|
| `id` | Non-empty, unique |
| `name` | **SHOULD** be unique for UI |
| `type` | **MUST NOT** be `UNSPECIFIED` |
| value_* | **SHOULD** match type |
| `unit` | Hint (`m`, `mm`, `in`, `deg`…); angles still stored in radians in `float_value` when `type = ANGLE` |
| `expression` | Optional; dialect TBD in a future minor — v0.2 engines **MAY** ignore |
| `driven` | If true, value is output of constraints/solve — writers **MUST NOT** expect user edits to stick without re-solve |
| `has_min` / `min_value`, `has_max` / `max_value` | Optional bounds; engines **SHOULD** clamp or reject out-of-range edits |

### 4.2 Types

`FLOAT`, `INT`, `BOOL`, `STRING`, `VEC2`, `VEC3`, `ANGLE`.

Duplicate `id` **MUST** cause document rejection.

---

## 5. Datums and reference geometry

Datums **MAY** appear outside the feature list for reusable references. Features **MAY** also create implicit datums via their results.

### 5.1 Datum plane

Defined by `origin` + `normal`, or `from_plane_id` + `offset` along that plane’s normal. `normal` **MUST** be non-zero.

### 5.2 Datum axis

`origin` + `direction` (non-zero).

### 5.3 Datum point

`position` in part space.

### 5.4 Coordinate system

`transform` mat4 from part space to local CSYS. Length **MUST** be 16.

---

## 6. Sketches

A `sketch` feature defines a 2D design on a plane.

### 6.1 Plane

Either:

- `origin`, `x_axis`, `y_axis` (non-zero; **SHOULD** be orthonormal; engines **MAY** orthonormalize), or
- `datum_plane_id` referencing a datum plane (engine builds a local frame).

### 6.2 Curves

Normative curve kinds: **line**, **circle**, **arc**, **ellipse**, **spline** (control poles + knots + degree).

- `construction = true` curves **MUST NOT** participate in profile solidification unless referenced by constraints only.
- Each curve **SHOULD** have a stable `id` string for constraint targeting when needed; otherwise `curve_indices` in constraints/loops refer to list positions.

### 6.3 Loops

`SketchLoop` lists ordered `curve_indices` forming a closed wire.

- Exactly one loop **SHOULD** have `outer = true` per sheet body profile.
- Additional loops with `outer = false` are **inner voids** (holes in the profile).
- If `loops` is empty, engines **MUST** treat all non-construction curves in order as a single outer loop (v0.1 compatibility).

### 6.4 Constraints

| Kind | Meaning | Operands |
|------|---------|----------|
| `COINCIDENT` | Points share location | 2 points |
| `HORIZONTAL` / `VERTICAL` | Line or point-pair aligned to sketch X/Y | line or 2 points |
| `PARALLEL` / `PERPENDICULAR` | Line-line | 2 curves |
| `TANGENT` | Curve-curve tangency | 2 curves |
| `EQUAL` | Equal length/radius as applicable | 2 curves |
| `MIDPOINT` | Point at segment midpoint | point + line |
| `SYMMETRIC` | Symmetric wrt line | 2 entities + mirror line |
| `FIXED` | Freeze entity | 1 entity |
| `CONCENTRIC` | Shared center | 2 circles/arcs |
| `COLLINEAR` | Lines collinear | 2 lines |
| `DISTANCE` | Dimensional distance | 2 entities + `value` or `parameter_id` |
| `ANGLE` | Dimensional angle | 2 lines + value/param |
| `RADIUS` / `DIAMETER` / `LENGTH` | Size dimensions | 1 curve + value/param |

When both `value` and `parameter_id` are set, `parameter_id` **SHOULD** win after solve.

Engines **MUST** attempt to satisfy constraints before building profiles. Over-constrained or failed solves **MUST** produce an explicit rebuild error (not a silent wrong solid).

### 6.5 Sketch point references

Constraints address endpoints/centers via `SketchPointRef` (`CURVE_START`, `CURVE_END`, `CURVE_CENTER`, `EXPLICIT`).

---

## 7. Feature history rules

1. `features` is strictly ordered; rebuild applies from index 0 upward.
2. Each feature **MUST** set exactly one `body` oneof.
3. `suppressed = true` **MUST** skip geometric effect but remain in the file.
4. `parameter_ids` lists dependencies for UI/graphs; payload fields remain authoritative unless a future expression dialect binds them.
5. `body_ids_out` **MAY** name bodies created/updated (multi-body). If empty, engines use an implicit default body `"default"`.
6. Topology refs (`FaceRef`, `EdgeRef`, `VertexRef`) identify entities from prior results. Engines **MUST** document their id assignment scheme. For interchange of fillet/chamfer selections, exporters **SHOULD** prefer robust selectors (see §10).

### 7.1 End conditions

Used by extrude/revolve/hole:

| Value | Meaning |
|-------|---------|
| `BLIND` | Use `distance` / `angle_rad` |
| `THROUGH_ALL` | Extend through all existing bodies along direction |
| `TO_FACE` | Stop at `to_face_id` |
| `TO_VERTEX` | Stop at `to_vertex_id` |
| `MIDPLANE` | Symmetric about profile plane using `distance` as total |
| `OFFSET_FROM_FACE` | Stop at face ± `offset_from_face` |

---

## 8. Solid feature catalogue

Unless noted, features operate on the **active body** (default or `target` field when present).

### 8.1 `extrude` — **Required**

Adds or cuts a prism from a sketch profile.

| Field | Rule |
|-------|------|
| `profile_sketch_id` | **MUST** exist and be a prior sketch |
| `end_condition` | **MUST** be set (not `UNSPECIFIED`) |
| `cut` | `false` join, `true` subtract |
| `merge` | if true, merge into target body |
| `draft_angle_rad` | optional taper |

Failure cases: empty profile, missing sketch, cut with empty body, singular direction.

### 8.2 `revolve` — **Required**

Revolve profile about axis (`axis_*` or `datum_axis_id`). `angle_rad` for `BLIND` **MUST** be in `(0, 2π]`.

### 8.3 `sweep` — **Recommended**

Sweep `profile_sketch_id` along `path_sketch_id`. Path **MUST** be an open or closed wire; profile plane **SHOULD** be normal to path start.

### 8.4 `loft` — **Recommended**

Loft through ≥ 2 profiles in order. Guide curves optional. Sections **MUST** be compatible (same loop topology).

### 8.5 `hole` — **Required**

Subtractive cylindrical (and optional CB/CS/tap) geometry.

| Type | Extra fields |
|------|----------------|
| `SIMPLE` | diameter, depth / end condition |
| `COUNTERBORE` | + CB diameter/depth |
| `COUNTERSINK` | + CS angle & diameter |
| `TAP` | + `tap_designation`, optional `thread` |

Position from `position`+`axis` and/or points in `sketch_id`.

### 8.6 `fillet` — **Recommended**

One or more `FilletEdgeSet` with radius. `tangent_propagate` extends to tangent edges.

### 8.7 `chamfer` — **Recommended**

Distance, distance-distance, or distance-angle modes via fields on `ChamferEdgeSet`.

### 8.8 `shell` — **Recommended**

Hollow solid: remove faces, apply wall `thickness` (inward/outward).

### 8.9 `draft` — **Recommended**

Apply draft angle to faces relative to neutral plane / parting definition.

### 8.10 `rib` — **Recommended**

Thin wall from open sketch profile to existing body.

### 8.11 `boolean` — **Required**

Union / subtract / intersect between target and tool bodies/features.

### 8.12 `mirror` — **Recommended**

Mirror feature contribution through datum plane.

### 8.13 `pattern_linear` / `pattern_circular` — **Recommended**

Instance source feature. **Count rule:** `count` is **total instances including source** (`PATTERN_COUNT_TOTAL_INCLUDING_SOURCE`). `skipped_instance_indices` are 0-based indices in the pattern sequence.

### 8.14 `thicken` — **Recommended**

Solid from surface feature by thickness.

### 8.15 `offset_faces` — **Recommended**

Offset selected faces by distance (direct editing style).

### 8.16 `move_face` — **Recommended**

Translate/rotate faces.

### 8.17 `split` — **Recommended**

Split bodies with sketch or face.

### 8.18 `thread` — **Recommended**

Cosmetic or modeled thread on cylindrical face/edge; `designation` carries standard callout (e.g. `M8x1.25`).

### 8.19 `helix` — **Recommended**

Helical sweep/cut (springs, threads path).

### 8.20 `transform_body` — **Recommended**

Rigid transform of a body; `copy` keeps original.

### 8.21 `sketch` — **Required**

See §6. Sketches produce no solid by themselves.

---

## 9. Configurations

`Configuration` overrides parameter values and feature suppressions.

- Exactly one configuration **SHOULD** have `is_default = true`.
- `active_configuration_id` selects which config rebuild uses.
- Missing parameter overrides inherit base `Parameter` values.
- Rebuild **MUST** apply suppressions after loading the feature list (suppressed features skipped).

---

## 10. Topology identity (faces / edges / vertices)

Industrial interchange of local operations (fillet, draft) requires selectors.

**v0.2 rules:**

1. Engines **MUST** assign string ids to faces/edges/vertices during rebuild.
2. Ids **SHOULD** be stable across rebuilds when the defining feature and local ordinal are unchanged (recommended scheme: `f{feature_id}.e{ordinal}`).
3. When targeting geometry from much earlier features, exporters **SHOULD** embed enough ordinal context; importers on different kernels **MAY** fail fillet/chamfer mapping — this **MUST** surface as a rebuild error, not a silent no-op.
4. A future minor **MAY** add geometric selectors (nearest to point, image curve) to reduce kernel coupling.

---

## 11. Conformance checklist

### 11.1 Round-trip reader/writer

- [ ] Preserve all messages/fields including unknown future oneofs when runtime allows
- [ ] Reject duplicate parameter/feature/datum ids
- [ ] Reject features with empty `body` oneof

### 11.2 Rebuild engine — Required

- [ ] Parameters + datums loading
- [ ] Sketch curves + loops + constraints (at least: coincident, horizontal, vertical, parallel, perpendicular, distance, radius)
- [ ] Extrude, revolve, hole, boolean
- [ ] Explicit errors on failure

### 11.3 Rebuild engine — Recommended (industrial completeness)

- [ ] Sweep, loft, helix
- [ ] Fillet, chamfer, shell, draft, rib
- [ ] Mirror, linear/circular pattern
- [ ] Thicken, offset/move face, split
- [ ] Thread (cosmetic minimum)
- [ ] Transform body
- [ ] Configurations

---

## 12. Binding to CADOM assemblies

Occurrence nodes **SHOULD** bind:

| Role | Asset |
|------|--------|
| `PARAMETRIC` | `.cadompart` |
| `MESH` | `.cadomesh` derived from rebuild |
| optional exact | STEP |

`Override` transforms still apply at assembly level without mutating this file.

---

## 13. Extensibility

- New normative features **MUST** bump `version_minor` (or major if breaking).
- Vendor-experimental operations **MUST NOT** overload normative oneof tags; use CADOM assembly `Extension` or a future `ExperimentalFeature` envelope in a later revision.
- Khronos/ISO alignments for threads and hole callouts **SHOULD** reuse common designation strings.

---

## 14. Examples

*Informative.*

- Extruded plate: [`fixtures/cadompart/example-extruded-plate.md`](../../fixtures/cadompart/example-extruded-plate.md)
- Plate + hole + fillet: [`fixtures/cadompart/example-plate-hole-fillet.md`](../../fixtures/cadompart/example-plate-hole-fillet.md)
- Legacy parameters-only: [`fixtures/cadompart/example-box-params.md`](../../fixtures/cadompart/example-box-params.md) (not sufficient for v0.2 rebuild demos)

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Parameter bag + opaque stubs |
| 0.1 | 2026-09-15 | Initial normative features (option A) |
| 0.2 | 2026-09-15 | Exhaustive industrial catalogue: constraints, datums, sweep/loft/shell/draft/rib/thread/helix/configs, conformance tiers (#45) |
