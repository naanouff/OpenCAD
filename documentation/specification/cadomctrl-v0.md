# CADOMCTRL Specification v0

**Status:** draft (v0) — control adjustments for a manufacturing gamme  
**File extension:** `.cadomctrl`  
**Serialization:** Protocol Buffers — [`packages/cadomctrl-proto/cadomctrl.proto`](../../packages/cadomctrl-proto/cadomctrl.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMCTRL` / role `CONTROL`  
**Doctrine:** [`../opencad-doctrine.md`](../opencad-doctrine.md)  
**Issue:** [#97](https://github.com/naanouff/OpenCAD/issues/97)

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 1. Purpose

CADOMCTRL carries **adjustment values** produced by control (inspection against the dead exact solid) for parameters declared in a [`.cadomfab`](cadomfab-v0.md) file.

The control file **MUST NOT** redefine tools, setups, operations, the instruction program, or the ideal definition. It assigns `variant_id` + `parameter_id → value`. Manufacturing replay and step visualization **MUST** use those values in place of that variant’s nominals. The `.cadomfab` bytes **MUST** stay unchanged.

A Control product still requires the graph and role `EXACT` (`.cadombrep`) for the part that was measured. This file is the feedback, not a metrology report.

### 1.1 In scope

- A reference to the manufacturing asset on the same node
- One value per adjusted parameter id
- An optional measured deviation, in the fab file’s length unit

### 1.2 Out of scope

- PMI, GD&T, balloons, inspection plans
- New parameter ids that the gamme did not declare
- Instruction-program edits, stock edits, fixture redesign
- STEP as a carrier for adjustments

---

## 2. File layout and versioning

The entire `.cadomctrl` file body **MUST** be a single serialized `cadomctrl.v0.CadomctrlFile` message.

Writers of v0 **MUST** set `version_major = 0` and `version_minor = 0`.

Media type **SHOULD** be `application/vnd.opencad.cadomctrl`.

---

## 3. Adjustments

| Field | Rule |
|-------|------|
| `fab_asset_id` | **SHOULD** be the asset id of the `MANUFACTURING` binding on the same node |
| `variant_id` | Non-empty. **MUST** equal a `GammeVariant.id` in the linked `.cadomfab` |
| `parameter_id` | Non-empty. **MUST** equal an `AdjustableParameter.id` in that variant |
| `value` | Replaces the nominal for replay and display. Same length unit as the fab file |
| `measured_deviation` | Optional. When set, it is the measured offset that justified `value` |

Rules:

1. Duplicate `(variant_id, parameter_id)` pairs in one file **MUST** be rejected.
2. When a `MANUFACTURING` binding is present, a consumer **MUST** report an explicit error if `variant_id` or `parameter_id` is absent from that `.cadomfab`. It **MUST NOT** invent either. When no gamme is bound, the control file stays valid and no manufacturing resolution runs.
3. Parameters omitted from this file keep their `.cadomfab` nominal.
4. Writers **MUST NOT** copy the gamme into this file to “apply” the correction.

---

## 4. Binding

On the same node as the gamme and the exact solid:

- `Asset.kind` **MUST** be `CADOMCTRL`
- Role **MUST** be `CONTROL`
- At most one `CONTROL` binding per node
- Role `EXACT` **MUST** still be `.cadombrep` when the occurrence claims control
- OpenCAD writers **MUST NOT** store adjustments in an `Extension` or as `STEP`

A node **MAY** bind `MANUFACTURING` without `CONTROL`, and **MAY** bind `CONTROL` without `MANUFACTURING`. Each file is valid alone. The consumer applies adjustments only when both bindings are present. A Control product that claims a measured part **MUST** still bind `EXACT`.

Worked example: [`fixtures/cadomctrl/example-wear-and-shift.md`](../../fixtures/cadomctrl/example-wear-and-shift.md), applied to [`fixtures/cadomfab/example-face-and-contour.md`](../../fixtures/cadomfab/example-face-and-contour.md).

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-11-20 | Initial draft: parameter assignments over a `.cadomfab` gamme (#97) |
