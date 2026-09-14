# CADOMETA Specification v0

**Status:** draft initial (v0)  
**File extension:** `.cadometa`  
**Serialization:** Protocol Buffers — [`packages/cadometa-proto/cadometa.proto`](../../packages/cadometa-proto/cadometa.proto)  
**Language:** English (normative)  
**CADOM kind:** `AssetKind.CADOMETA` / role `METADATA`

The key words **MUST**, **MUST NOT**, **SHOULD**, **MAY** are as in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## 1. Purpose

CADOMETA carries **metadata** associated with a CADOM node occurrence (PLM attributes, labels, custom structured blobs). It is not geometry, materials, or parametric rebuild data.

## 2. File layout

The entire `.cadometa` file body **MUST** be a single serialized `cadometa.v0.CadometaFile` Protobuf message.

Writers producing v0 **MUST** set `version_major = 0` and `version_minor = 0`.

## 3. Entries

Each `MetaEntry` **MUST** have a non-empty `key`.

| Field | Rule |
|-------|------|
| `key` | Non-empty string |
| `value` | Unicode string (interpretation depends on `value_type`) |
| `value_type` | Defaults to `STRING` when `UNSPECIFIED` |

### 3.1 Value types

| Type | `value` content |
|------|-----------------|
| `STRING` | Arbitrary text |
| `NUMBER` | Decimal literal (e.g. `12.5`) — canonical parsing is application-defined |
| `BOOL` | Exactly `true` or `false` (lowercase **RECOMMENDED**) |
| `JSON` | A JSON text document or fragment |

Writers **SHOULD** keep keys unique within a file. If duplicates exist, readers **MAY** keep all entries on round-trip; resolution policy for display is application-defined.

Keys **SHOULD** use a reverse-DNS or namespaced form for vendor attributes (e.g. `com.example.mass_kg`).

## 4. Opaque payload

`opaque_payload` **MAY** hold vendor bytes. When non-empty:

- `opaque_content_type` **SHOULD** identify the format (MIME-like string);
- readers that do not understand the payload **MUST** still preserve it on round-trip.

Empty `opaque_payload` means unused.

## 5. Binding to CADOM

Bound with role `METADATA` on a node. Multiple nodes **MAY** share one cadometa asset; typically each occurrence has its own.

## 6. Validation summary

A v0 reader **MUST** reject empty `MetaEntry.key` values. Unknown future fields **SHOULD** be preserved when the runtime allows.

## 7. Normative schema

See [`packages/cadometa-proto/cadometa.proto`](../../packages/cadometa-proto/cadometa.proto).

## 8. Out of scope for v0

- Formal PLM/BIM ontologies
- Guaranteed typed schema registry for keys
- Encryption / signing of metadata

## 9. Example

*Informative.* See [`fixtures/cadometa/example-part-attrs.md`](../../fixtures/cadometa/example-part-attrs.md).

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 0.0 | 2026-09-14 | Initial draft (NATIVE-04) |
