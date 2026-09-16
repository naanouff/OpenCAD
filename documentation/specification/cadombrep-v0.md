# CADOMBREP Specification v0 (stub)

**Status:** draft stub (v0) — dead / frozen B-Rep envelope  
**File extension:** `.cadombrep`  
**Serialization:** Protocol Buffers — [`packages/cadombrep-proto/cadombrep.proto`](../../packages/cadombrep-proto/cadombrep.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMBREP` / role `EXACT`  
**Doctrine:** [`../opencad-doctrine.md`](../opencad-doctrine.md) (B3′)  
**Issue:** [#55](https://github.com/naanouff/OpenCAD/issues/55)

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 1. Purpose

CADOMBREP is the CADOM-native **dead B-Rep envelope**: a frozen exact solid snapshot produced by the **OpenCAD Kernel** from a `.cadompart` rebuild.

It is the exchange / metrology / archive counterpart of the parametric recipe:

| Asset | Role |
|-------|------|
| `.cadompart` | Living **intent** (feature history) |
| OpenCAD Kernel | Exact solid **at runtime** |
| `.cadombrep` | Exact solid **persisted** (dead envelope) |
| `.cadomesh` | Display tessellation (viz without kernel) |

Industry STEP/AP242 **MUST NOT** be treated as a substitute for `.cadombrep` in the OpenCAD truth model (import tools **MAY** ingest STEP to *produce* cadombrep / cadomesh / cadompart).

### 1.1 In scope (v0 stub)

- Provenance (kernel id/version, source cadompart id/hash, configuration)
- Topology id lists (body / face / edge / vertex) using the OpenCAD Kernel id scheme
- Opaque solid payload with a declared `BrepEncoding`
- Binding rules to CADOM assemblies (role `EXACT`)

### 1.2 Out of scope (v0 stub)

- Normative analytic B-Rep (NURBS / trimmed faces) as OpenCAD-native protobuf messages — reserved (`BREP_ENCODING_OPENCAD_NATIVE`)
- PMI / GD&T presentation
- Assembly mates
- Guaranteeing bit-identical solids across third-party kernels

---

## 2. File layout and versioning

The entire `.cadombrep` file body **MUST** be a single serialized `cadombrep.v0.CadombrepFile` Protobuf message. No additional framing is defined in v0.

Writers producing v0 **MUST** set `version_major = 0` and `version_minor = 0`.

Media type **SHOULD** be `application/vnd.opencad.cadombrep`.

---

## 3. Coordinate system

- If `units` is `LENGTH_UNIT_UNSPECIFIED`, consumers **MUST** inherit length units from the referencing `.cadom` document.
- If `up_axis` is `UP_AXIS_UNSPECIFIED`, consumers **MUST** inherit up-axis from the referencing `.cadom` document.
- When set, `units` / `up_axis` **MUST** be interpreted as in the CADOM assembly spec (§2).
- Geometry in `solid_blob` **MUST** be expressed in this file’s length unit and up-axis convention.

---

## 4. Provenance (normative)

A conforming writer that exports from the OpenCAD Kernel **MUST** set:

| Field | Rule |
|-------|------|
| `kernel_id` | Non-empty product id (e.g. `opencad-kernel`) |
| `kernel_version` | Non-empty version string of the producing kernel |
| `source_cadompart_sha256` | **SHOULD** be set when the source `.cadompart` bytes are known |
| `source_cadompart_id` | **SHOULD** identify the source part/asset when known |
| `active_configuration_id` | **SHOULD** match the cadompart configuration used at rebuild |

Readers that perform metrology or legal archive **SHOULD** treat mismatched provenance vs a fresh rebuild as a **stale envelope** warning (application-defined policy).

---

## 5. Topology ids

`body_ids`, `face_ids`, `edge_ids`, and `vertex_ids` **SHOULD** list the entity ids present in the solid, using the **OpenCAD Kernel** assignment scheme (see kernel backlog K3-6 / cadompart §10).

- Ids **MUST** be non-empty strings when listed.
- Duplicate ids within one list **MUST** cause rejection.
- Empty lists are allowed in v0 stub when the encoding does not yet expose a stable enumeration; Complete writers **SHOULD** populate them once K3-6 is implemented.

---

## 6. Solid encoding

| `encoding` | Meaning |
|------------|---------|
| `UNSPECIFIED` | Invalid for Complete writers; readers **MUST** reject if `solid_blob` is also empty |
| `OPENCAD_NATIVE` | Reserved — native protobuf solid model **not defined** in this stub; writers **MUST NOT** emit until a later minor defines it |
| `OCCT_BREP` | Bootstrap: `solid_blob` holds an Open CASCADE Technology BREP serialization as produced by the kernel bootstrap path |

Rules:

1. When `encoding != UNSPECIFIED`, `solid_blob` **MUST** be non-empty.
2. Consumers that do not understand an encoding **MUST** still round-trip the file bytes (pass-through at the CADOM Asset level).
3. A future minor **MAY** define `OPENCAD_NATIVE` without changing field numbers.

---

## 7. Binding to CADOM

| Role | Kind |
|------|------|
| `EXACT` | `CADOMBREP` |

- Complete OpenCAD part occurrences **MUST** bind `EXACT` → `.cadombrep` (doctrine profile **Complete**).
- After parametric edit, exporters **SHOULD** refresh both `.cadombrep` and `.cadomesh` from the same kernel rebuild.
- Writers **MUST NOT** bind role `EXACT` to `AssetKind.STEP`.

---

## 8. Validation summary

A v0 reader **MUST** reject:

- empty duplicate topology ids within a list;
- `encoding = OPENCAD_NATIVE` until that encoding is defined in a later revision;
- `encoding != UNSPECIFIED` with empty `solid_blob`.

Unknown future fields **SHOULD** be preserved on round-trip when the Protobuf runtime allows.

---

## 9. Normative schema

See [`packages/cadombrep-proto/cadombrep.proto`](../../packages/cadombrep-proto/cadombrep.proto).

---

## 10. Relation to kernel badge

Export of `.cadombrep` is part of the OpenCAD Kernel track (see [`../sprint-kernel-k3.md`](../sprint-kernel-k3.md) K3-8). The first Required rebuild badge **MAY** ship mesh goldens before cadombrep goldens; **Complete** product claims **MUST NOT** be made without a cadombrep writer that satisfies this stub’s provenance rules.

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-16 | Initial stub: provenance, topo ids, OCCT_BREP bootstrap (#55) |
