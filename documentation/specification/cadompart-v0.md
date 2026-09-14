# CADOMPART Specification v0

**Status:** draft initial (v0)  
**File extension:** `.cadompart`  
**Serialization:** Protocol Buffers — [`packages/cadompart-proto/cadompart.proto`](../../packages/cadompart-proto/cadompart.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMPART` / role `PARAMETRIC`

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## 1. Purpose

CADOMPART stores **parametric part-definition data** (named parameters and optional feature stubs). It is **not**:

- the assembly occurrence graph (`.cadom`);
- tessellated display geometry (`.cadomesh`);
- a full CAD rebuild kernel or feature-history standard.

v0 defines a portable **parameter bag** plus lightweight **feature** records so tools can exchange editable parameters without mandating a specific modeller.

## 2. File layout

The entire `.cadompart` file body **MUST** be a single serialized `cadompart.v0.CadompartFile` Protobuf message.

Writers producing v0 **MUST** set `version_major = 0` and `version_minor = 0`.

## 3. Parameters

Each `Parameter` **MUST** have:

| Field | Rule |
|-------|------|
| `id` | Non-empty; unique within the file |
| `name` | **SHOULD** be non-empty for UI |
| `type` | **MUST NOT** be `UNSPECIFIED` when written |

### 3.1 Values

Writers **SHOULD** set exactly one value field matching `type`:

| `type` | Value field |
|--------|-------------|
| `FLOAT` | `float_value` |
| `INT` | `int_value` |
| `BOOL` | `bool_value` |
| `STRING` | `string_value` |
| `VEC3` | `vec3_value` |

Readers that encounter a mismatched or missing value **SHOULD** warn and **MAY** treat the parameter as unset for evaluation while still round-tripping bytes.

`unit` is an optional hint (e.g. `m`, `mm`, `deg`). Empty means no declared unit. Interpretation of units is application-defined in v0; when the part is used under a `.cadom` in metres, float length parameters **SHOULD** be stored in metres unless `unit` says otherwise.

`expression` is an optional unevaluated string for authoring systems. CADOM core **MUST NOT** require evaluating expressions.

## 4. Features

Each `Feature` is a stub:

| Field | Meaning |
|-------|---------|
| `id` | Unique within the file |
| `type` | Opaque type token (`extrude`, `hole`, …) — **no** closed vocabulary in v0 |
| `name` | Optional label |
| `parameter_ids` | References to `Parameter.id` values used by this feature |

Unknown `type` values **MUST** be preserved. Readers that do not understand a feature **MUST** still round-trip it (same spirit as CADOM extensions).

Duplicate `id` among parameters or among features **MUST** be rejected.

## 5. Binding to CADOM

A part occurrence node **SHOULD** bind this file with role `PARAMETRIC`. Display **SHOULD** still use a `MESH` binding (often `.cadomesh`) produced by a modeller or tessellator — CADOMPART alone does not define triangles.

## 6. Validation summary

A v0 reader **MUST** reject:

- empty `Parameter.id` / `Feature.id`;
- duplicate parameter or feature ids;
- `ParamType.UNSPECIFIED` on a written parameter.

## 7. Normative schema

See [`packages/cadompart-proto/cadompart.proto`](../../packages/cadompart-proto/cadompart.proto).

## 8. Out of scope for v0

- Constraint solvers, sketches, B-Rep recipes
- Guaranteed rebuild across vendors
- Inheritance / configuration tables (may come later)

## 9. Example

*Informative.* See [`fixtures/cadompart/example-box-params.md`](../../fixtures/cadompart/example-box-params.md).

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Initial draft (NATIVE-02) |
