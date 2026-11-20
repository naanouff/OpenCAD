# CADOMFAB Specification v0

**Status:** draft (v0) — nominal manufacturing process  
**File extension:** `.cadomfab`  
**Serialization:** Protocol Buffers — [`packages/cadomfab-proto/cadomfab.proto`](../../packages/cadomfab-proto/cadomfab.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMFAB` / role `MANUFACTURING`  
**Doctrine:** [`../opencad-doctrine.md`](../opencad-doctrine.md)  
**Issue:** [#97](https://github.com/naanouff/OpenCAD/issues/97)

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 1. Purpose

CADOMFAB is the CADOM **nominal manufacturing process**: stock, tools, setups (posage), and an ordered sequence of operations (gamme) with toolpaths.

It is process intent, **not** geometry truth. The finished solid remains `.cadombrep` under role `EXACT`. Design intent remains `.cadompart`. Control corrections **MUST NOT** be stored in this file; they live in [`.cadomctrl`](cadomctrl-v0.md).

A Manufacturing consumer uses this file to display each step from stock to finished part. Material-removal simulation is a later consumer of the same data and is **out of scope** for v0 software in this repository.

### 1.1 In scope

- One stock blank (dead solid reference, or a box, or a cylinder)
- Tool records (end mill, ball mill, drill, face mill)
- Setups: part-to-setup transform and a fixture description
- Ordered operations, each bound to one setup and one tool
- Motions as polylines in the setup frame: rapid (no removal) or feed (removal)
- Adjustable parameters that control **MAY** override (ids are stable)

### 1.2 Out of scope

- Arcs, splines, 5-axis poses, tool-change cycles, cycle time
- Swept-volume or Boolean material removal
- Editing `.cadompart` or `.cadombrep`
- PMI / GD&T
- STEP as a carrier for the gamme

---

## 2. File layout and versioning

The entire `.cadomfab` file body **MUST** be a single serialized `cadomfab.v0.CadomfabFile` message. No extra framing is defined in v0.

Writers of v0 **MUST** set `version_major = 0` and `version_minor = 0`.

Media type **SHOULD** be `application/vnd.opencad.cadomfab`.

---

## 3. Units and frames

- If `units` or `up_axis` is unspecified, consumers **MUST** inherit them from the referencing `.cadom` document.
- Stock sizes, tool diameters, flute lengths, parameter values, and path coordinates **MUST** use this file’s length unit.
- `Setup.part_to_setup`, when present, **MUST** contain 16 floats (column-major mat4) taking part coordinates into the setup frame. Empty **MUST** mean identity.
- Motion polylines **MUST** be expressed in the setup frame of the operation’s `setup_id`.

---

## 4. Stock

`Stock.blank` **MUST** be set to exactly one of:

| Case | Rule |
|------|------|
| `cadombrep_uri` | Non-empty URI of a `.cadombrep` blank. Relative URIs resolve like CADOM asset URIs |
| `box` | `size_x`, `size_y`, and `size_z` **MUST** be > 0, centred on the part origin |
| `cylinder` | `diameter` and `height` **MUST** be > 0. Axis is +Z of the part frame |

---

## 5. Tools, setups, operations

- Every `Tool.id`, `Setup.id`, `Operation.id`, and `AdjustableParameter.id` **MUST** be unique within the file and non-empty.
- `Operation.setup_id` and `Operation.tool_id` **MUST** refer to ids in this file.
- Document order of `operations` **MUST** be the gamme order.
- Each motion **MUST** set `kind` to `RAPID` or `FEED` and **MUST** contain at least two points.
- `FEED` is a cutting move. `RAPID` **MUST NOT** be treated as material removal.
- v0 paths are polylines only. Writers **MUST NOT** encode arcs by overloading point lists.

---

## 6. Adjustable parameters

Manufacturing **declares** the knobs. Control does not invent them.

| Quantity | Target | Meaning of `nominal` |
|----------|--------|----------------------|
| `TOOL_LENGTH_WEAR` | `TOOL` | Length correction added to the tool, 0 = no wear |
| `SETUP_SHIFT_X` / `Y` / `Z` | `SETUP` | Translation of the setup frame along that part axis |
| `STOCK_ALLOWANCE` | `OPERATION` or `SETUP` | Extra stock left on the blank for that target |

Rules:

1. `target_id` **MUST** refer to a tool, setup, or operation id matching `target`.
2. The nominal **MUST** stay in this file when a `.cadomctrl` assigns a new value.
3. A Manufacturing consumer that also has a `CONTROL` binding on the same node **MUST** replace each listed nominal with the control value before display or replay.
4. Without a control file, the consumer **MUST** use the nominals.

---

## 7. Replay contract (informative)

A later simulator **MUST** start from the stock, apply control adjustments when present, and subtract the tool sweep along `FEED` motions in gamme order. The finished `.cadombrep` is the target solid, not an output of this file. v0 does not require an implementation of that simulator.

---

## 8. Binding

In the referencing `.cadom`:

- `Asset.kind` **MUST** be `CADOMFAB`
- The node binding role **MUST** be `MANUFACTURING`
- At most one `MANUFACTURING` binding per node (CADOM multi-asset rule)
- OpenCAD writers **MUST NOT** store the gamme in an `Extension` or as `STEP`

Worked example: [`fixtures/cadomfab/example-face-and-contour.md`](../../fixtures/cadomfab/example-face-and-contour.md).

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-11-20 | Initial draft: stock, tools, setups, polyline motions, adjustable parameters (#97) |
