# OpenCAD product doctrine

**Status:** process / product doctrine (non-normative for wire formats; **binding for OpenCAD product direction**)  
**Date:** 2026-09-15  
**Issue:** [#51](https://github.com/naanouff/OpenCAD/issues/51)  
**Supersedes (direction):** fil rouge SWOT-1 « JT-web sans kernel ». Current expert analysis: [`cadom-spec-swot.md`](cadom-spec-swot.md) (SWOT-2). **Product decisions below win** when they conflict with any SWOT wording.

---

## 1. Positioning

OpenCAD is a **CAD platform** (formats + toolchain), not only an exchange graph format.

Two capabilities are **co-primary (doctrine B)**:

1. **Assembly orchestration** — `.cadom` flat UUID DAG, overrides, extensions, late-loaded viz.
2. **Parametric rebuild** — `.cadompart` feature history executed by the **OpenCAD B-Rep kernel (K3)**.

Neither is a second-class add-on for a **Complete** OpenCAD product.

---

## 2. Truth model (B3 files + K3 runtime)

| Concern | Truth |
|---------|--------|
| Design intent | `.cadompart` |
| Exact solid (runtime) | **OpenCAD kernel** rebuild of cadompart |
| Exchange / viz without kernel | `.cadomesh` (and optionally glTF/GLB) under role `MESH` |
| STEP / AP242 | **Out of the OpenCAD truth model** — do not reference as geometric truth in normative specs |

**B3:** no mandatory persisted exact B-Rep file for exchange; mesh carries viz.  
**K3:** the OpenCAD product **MUST** specify and ship a B-Rep kernel component (not “any external OCCT behind the SDK” as an afterthought).

### Profiles

| Profile | Required |
|---------|----------|
| **Graph** | Valid `.cadom` |
| **Viz** | Graph + `MESH` (cadomesh / glTF) |
| **Design** | Graph + `PARAMETRIC` + **OpenCAD kernel** |
| **Complete** | Graph + parametric + mesh (+ kernel to refresh mesh) |

A `.cadom` document alone **MAY** be valid as a graph. A **Complete OpenCAD product** requires the rebuild path.

---

## 3. Fil rouge (canonical wording)

> OpenCAD carries two co-primary capabilities: assembly orchestration (`.cadom`) and parametric rebuild (`.cadompart`) on the **OpenCAD B-Rep kernel**.  
> Intent and exactness live in **cadompart + kernel**.  
> Kernel-free exchange/visualization uses **cadomesh**.  
> A Complete OpenCAD product binds graph + parametric + mesh.  
> STEP/AP242 are not part of the OpenCAD truth model.

---

## 4. Rebuild scope (agile)

- **Required** engine (first badge): sketch (base constraints) + extrude, revolve, hole, boolean.
- Method: **TDD**, mass golden tests (`cadompart` → kernel solid → `cadomesh` asserts).
- Broader catalogue in cadompart remains **exchange vocabulary**; not a conformance claim until badges grow.
- Expressions: forbidden until a versioned dialect exists.
- `default_active_layers` on `.cadom`: **kept** (exchangeable default override view).

---

## 5. Kernel (K3) — intent for specification

Normative kernel work (separate specs / packages, later issues) **MUST** cover:

1. Component identity: OpenCAD Kernel (versioning, API surface concept).
2. Geometric domain for Required features (solids, tolerances policy).
3. Stable entity id scheme for faces/edges used by later features.
4. Tessellation export to `.cadomesh`.
5. Distribution as an OpenCAD product dependency (licence/dep choice documented when selected).

Until the kernel package exists, cadompart §11.4 points here: **reference engine = OpenCAD Kernel (K3)**; implementation may bootstrap on OCCT but the **product contract** is OpenCAD’s kernel, not “bring your own”.

---

## 6. Roadmap alignment

| Track | Content |
|-------|---------|
| Spec hygiene | Purge STEP-as-truth from normative docs; align fil rouge (#51) |
| Kernel backlog | [`sprint-kernel-k3.md`](sprint-kernel-k3.md) |
| P1 assembly | `.cadomz`, occurrence PLM, multi-reps, mates as extension — still accepted |
| P3 viz | Face groups / LOD; CAD-friendly cadomat defaults — accepted; PMI without AP242 |

---

## 7. Proto legacy note

`AssetKind.STEP` and `AssetRole.EXACT` may remain in frozen protobuf enums for wire compatibility. OpenCAD writers **MUST NOT** treat them as part of the product truth model; normative prose **MUST NOT** present STEP as OpenCAD exact geometry.
