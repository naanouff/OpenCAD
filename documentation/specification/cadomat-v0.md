# CADOMAT Specification v0

**Status:** draft initial (v0)  
**File extension:** `.cadomat`  
**Serialization:** Protocol Buffers — [`packages/cadomat-proto/cadomat.proto`](../../packages/cadomat-proto/cadomat.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMAT` / role `MATERIAL`

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## 1. Purpose

CADOMAT is the CADOM-native **physically based material** format. Material **semantics** **MUST** align with the Khronos **glTF 2.0 metallic-roughness** model ([glTF 2.0 § Materials](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#materials)).

CADOMAT does not embed large image bitmaps in v0; textures are referenced by URI.

## 2. File layout

The entire `.cadomat` file body **MUST** be a single serialized `cadomat.v0.CadomatFile` Protobuf message. No additional framing is defined in v0.

Writers producing v0 **MUST** set `version_major = 0` and `version_minor = 0`.

## 3. Factor defaults

When a factor field is omitted or empty, readers **MUST** apply these defaults (matching glTF):

| Property | Default |
|----------|---------|
| `base_color_factor` | `[1, 1, 1, 1]` (RGBA) |
| `metallic_factor` | `1.0` |
| `roughness_factor` | `1.0` |
| `emissive_factor` | `[0, 0, 0]` (RGB) |
| `normal_scale` | `1.0` |
| `occlusion_strength` | `1.0` |
| `alpha_mode` | `OPAQUE` (also if `UNSPECIFIED`) |
| `alpha_cutoff` | `0.5` (used when mode is `MASK`) |
| `double_sided` | `false` |

### 3.1 Factor array lengths

- If `base_color_factor` is non-empty, length **MUST** be 4; all values finite; each component **SHOULD** be in `[0, 1]`.
- If `emissive_factor` is non-empty, length **MUST** be 3; all values finite; components **SHOULD** be ≥ 0.
- `metallic_factor` and `roughness_factor`, when set, **MUST** be finite and **SHOULD** be in `[0, 1]`.

## 4. Textures

Each optional `TextureRef` has:

| Field | Meaning |
|-------|---------|
| `uri` | Image location; relative URIs **MUST** resolve against the directory containing the `.cadomat` file |
| `tex_coord` | Attribute set index; default `0` when unset |

A `TextureRef` with an empty `uri` **MUST** be treated as absent.

v0 does not define sampler wrap/filter overrides; consumers **SHOULD** use glTF-like defaults (repeat, linear mipmap linear) unless the runtime defines otherwise.

### 4.1 Texture roles (glTF mapping)

| CADOMAT field | glTF property | Notes |
|---------------|---------------|-------|
| `base_color_texture` | `pbrMetallicRoughness.baseColorTexture` | sRGB |
| `metallic_roughness_texture` | `pbrMetallicRoughness.metallicRoughnessTexture` | linear; **G** = roughness, **B** = metalness |
| `normal_texture` | `normalTexture` | tangent-space |
| `occlusion_texture` | `occlusionTexture` | **R** channel |
| `emissive_texture` | `emissiveTexture` | sRGB |

Image codecs in v0: consumers **SHOULD** support PNG and JPEG referenced by URI. Other formats **MAY** be supported.

## 5. Alpha and sidedness

- `ALPHA_MODE_OPAQUE` — ignore alpha for coverage.
- `ALPHA_MODE_MASK` — discard fragments with alpha < `alpha_cutoff`.
- `ALPHA_MODE_BLEND` — standard alpha blend; exact blend equation is runtime-defined but **SHOULD** match typical glTF viewers.

`double_sided = true` **MUST** disable back-face culling for this material.

## 6. Binding to CADOM

- Referenced from a node via `asset_bindings` role `MATERIAL`, and/or from `Override.material_ref` (Asset id).
- When both a node `MATERIAL` binding and an active override `material_ref` exist, the override **MUST** win (§5 of the assembly spec).

## 7. Validation summary

A v0 reader **MUST** reject files that violate factor array lengths or non-finite required numeric values in §§3–4. Unknown future fields **SHOULD** be preserved on round-trip when the Protobuf runtime allows.

## 8. Normative schema

See [`packages/cadomat-proto/cadomat.proto`](../../packages/cadomat-proto/cadomat.proto).

## 9. Out of scope for v0

- KHR clearcoat / transmission / specular / volume / ior (may appear in later minors)
- Embedded binary images inside the `.cadomat` payload
- Full glTF material extensions registry

## 10. Example

*Informative.* See [`fixtures/cadomat/example-red-metal.md`](../../fixtures/cadomat/example-red-metal.md).

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Initial draft (NATIVE-03) |
