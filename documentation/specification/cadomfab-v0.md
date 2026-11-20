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

CADOMFAB is the CADOM **nominal manufacturing process**: stock, tools, setups (posage), and an ordered sequence of operations (gamme). Each operation carries a program in a **neutral instruction dialect**, in the spirit of machine consignes, not a baked polyline and not a controller brand language.

It is process intent, **not** geometry truth. The finished solid remains `.cadombrep` under role `EXACT`. Design intent remains `.cadompart`. Control corrections **MUST NOT** be stored in this file; they live in [`.cadomctrl`](cadomctrl-v0.md).

### 1.0 Definition and variants

The assembly and part carried by the referencing `.cadom` node are a **definition version**: the product in its ideal intent (`.cadompart` for the recipe, `.cadombrep` for the ideal finished solid).

`.cadomfab` **inherits** that definition. It **MUST NOT** copy it, fork it, or replace `EXACT` / `PARAMETRIC`. Each `GammeVariant` is a manufacturing variant **derived** from that ideal and adapted to one gamme: its own stock, setups, operations, and adjustable parameters. Several variants **MAY** share the tool list. A variant **MUST NOT** be stored as a second design intent.

A Manufacturing consumer uses a variant to display each step from that variant’s stock toward the ideal finished part. Material-removal simulation is a later consumer and is **out of scope** for v0 software in this repository.

### 1.1 In scope

- One or more gamme variants inherited from the ideal definition
- Per variant, one stock blank (dead solid reference, or a box, or a cylinder)
- Tool records (end mill, ball mill, drill, face mill)
- Setups: a user-authored machine-to-setup matrix and a fixture description
- Ordered operations, each bound to one setup and one tool
- A slot for that instruction program (dialect id + bytes). The dialect itself is **not** defined in v0
- Adjustable parameters that control **MAY** override (ids are stable)

### 1.2 Out of scope

- The syntax of the instruction dialect (opcodes, arcs, feeds, axis set)
- Tool-change cycles, cycle time
- Swept-volume or Boolean material removal
- A gamme that spans several child parts of an assembly (later)
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

### 3.1 Frames

The product frame is the definition frame of the occurrence (the ideal part). The machine frame and the setup frame belong to the manufacturing environment of a gamme.

The user authors, in this file, the **transposition from one matrix to the next**: product → machine → setup. That rule is the methodology. It is not a datum list, not a constraint system, and not a separate document. A consumer **MUST** apply those matrices to place the product model in the machine and in the setup. It **MUST NOT** invent another alignment.

`product_to_machine` and `machine_to_setup` are those transpositions. Each, when set, **MUST** be 16 floats, column-major. Empty **MUST** mean the user has not defined that step. Readers **MUST NOT** treat an empty transform as identity.

Tool axis, the direction of `TOOL_LENGTH_WEAR`, and the axes of `SETUP_SHIFT_*` follow the same user-authored matrices. v0 does not add a further static axis rule.

| Field | Resolved placement |
|-------|--------------------|
| `GammeVariant.product_to_machine` | Product model positioned in that gamme’s machine |
| `Setup.machine_to_setup` | That machine positioned on the setup |

Tool axis, the direction of `TOOL_LENGTH_WEAR`, and the axes of `SETUP_SHIFT_*` are outputs of the same resolution. v0 **MUST NOT** freeze them (no implicit machine +Z, no fixed order “shift then setup”). The instruction dialect, when it exists, **MUST** use the frames that resolution produced. v0 has no syntax for those coordinates yet.

---

## 4. Stock

Each variant’s `Stock.blank` **MUST** be set to exactly one of the shapes below. The blank has its own frame, `Stock.frame`: a positioned and oriented matrix in the product frame. There is no fixed part axis. Empty `frame` **MUST** mean unresolved, not identity.

Local shape, expressed in that stock frame:

| Case | Rule |
|------|------|
| `cadombrep_uri` | Non-empty URI of a `.cadombrep` blank. Relative URIs resolve like CADOM asset URIs. The solid is placed by `Stock.frame` |
| `box` | `size_x`, `size_y`, and `size_z` **MUST** be > 0, measured along the stock frame axes, centered on the stock frame origin |
| `cylinder` | `diameter` and `height` **MUST** be > 0. The axis is +Z of the stock frame |

---

## 5. Tools, setups, operations

- The file **MUST** contain at least one variant. Variant ids **MUST** be unique and non-empty.
- `Tool.id` **MUST** be unique in the file. `Setup.id`, `Operation.id`, and `AdjustableParameter.id` **MUST** be unique inside their variant and non-empty.
- `Operation.setup_id` **MUST** refer to a setup in the same variant. `Operation.tool_id` **MUST** refer to a tool in the file.
- Document order of `operations` inside a variant **MUST** be that gamme’s order. Document order of `variants` is the proposed order, not a machining sequence across variants.

### 5.1 Instruction program

The path of an operation is a program of machine consignes. The language is neutral: it **MUST NOT** be a vendor G-code, ISO dialect, or a polyline standing in for one. OpenCAD will publish the dialect in a later specification.

Until that dialect exists:

| Field | Rule |
|-------|------|
| `instruction_dialect` | **MUST** be the token `opencad.fab.instr.unspecified` |
| `instructions` | **MUST** be empty |

Writers **MUST NOT** put G-code or any private encoding in `instructions` while the dialect is unspecified. Readers **MUST** reject a v0 file whose dialect is unspecified and whose `instructions` are not empty.

The future dialect **MUST** be able to order consignes, to express them in the frames the user transposed (§3.1), and to distinguish a non-cutting move from a material-removal move. Opcodes, arcs, and the axis set are not decided here.

### 5.2 Post-processing

The bytes in `.cadomfab` are the **neutral** program. They are not the language of a machine.

A post-processor **MUST** read that neutral program, after control adjustments have been applied, and emit the consignes of one controller. Two machines **MUST** be able to receive two different posts from the same `.cadomfab`. The posted program **MUST NOT** be written back into `instructions`, and it **MUST NOT** replace the neutral program as the manufacturing truth.

v0 does not define the post-processor, the machine identity, or the controller dialect.

---

## 6. Adjustable parameters

Manufacturing **declares** the knobs. Control does not invent them.

| Quantity | Target | Meaning of `nominal` |
|----------|--------|----------------------|
| `TOOL_LENGTH_WEAR` | `TOOL` | Length correction of the tool. 0 = no wear. The axis and the sign are those of the resolved methodology (§3.1), not a fixed machine +Z |
| `SETUP_SHIFT_X` / `Y` / `Z` | `SETUP` | Named translation of the setup. Which frame and which direction follow the user-authored matrices (§3.1) |

Rules:

1. `target_id` **MUST** refer to a tool in the file, or to a setup or operation in the same variant, matching `target`.
2. The nominal **MUST** stay in this file when a `.cadomctrl` assigns a new value.
3. A Manufacturing consumer that also has a `CONTROL` binding on the same node **MUST** replace each listed nominal with the control value before display, replay, or post-processing.
4. Without a control file, the consumer **MUST** use the nominals.

---

## 7. Replay contract (informative)

A later simulator **MUST** start from the variant’s stock, apply control adjustments for that variant when present, and execute the **neutral** instruction program in gamme order once the dialect exists. It **MUST NOT** require a machine post to preview removal. The ideal `.cadombrep` stays the definition target, not an output of the variant. v0 does not define the dialect, the post-processor, or a simulator.

---

## 8. Binding

In the referencing `.cadom`:

- `Asset.kind` **MUST** be `CADOMFAB`
- The node binding role **MUST** be `MANUFACTURING`
- At most one `MANUFACTURING` binding per node (CADOM multi-asset rule)
- The default view of the occurrence **MUST** be the ideal definition (`.cadompart` / `.cadombrep`), not a manufacturing variant. Variants are shown in the manufacturing context
- `MANUFACTURING` **MAY** be absent when only `CONTROL` is bound, and the reverse. The consumer runs the manufacturing resolution only when a `.cadomfab` is present, and applies `.cadomctrl` only when both are present
- OpenCAD writers **MUST NOT** store the gamme in an `Extension` or as `STEP`

Worked example: [`fixtures/cadomfab/example-face-and-contour.md`](../../fixtures/cadomfab/example-face-and-contour.md).

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-11-20 | Initial draft: variants inherited from the ideal definition; placement of the product in the machine and the setup is resolved from the user methodology, not a static frame convention; instruction program reserved (`opencad.fab.instr.unspecified`) (#97) |
