# OpenCAD product doctrine

**Status:** process / product doctrine (non-normative for wire formats; **binding for OpenCAD product direction**)  
**Date:** 2026-09-16  
**Issues:** [#51](https://github.com/naanouff/OpenCAD/issues/51) (B3+K3), [#55](https://github.com/naanouff/OpenCAD/issues/55) (B3′ + cadombrep)  
**Supersedes (direction):** fil rouge SWOT-1 « JT-web sans kernel »; B3 « no persisted exact » replaced by **B3′** (dead B-Rep via `.cadombrep`). Current expert analysis: [`cadom-spec-swot.md`](cadom-spec-swot.md) (SWOT-2). **Product decisions below win** when they conflict with any SWOT wording.

---

## 1. Positioning

OpenCAD is a **CAD platform** (formats + toolchain), not only an exchange graph format.

Two capabilities are **co-primary (doctrine B)**:

1. **Assembly orchestration** — `.cadom` flat UUID DAG, overrides, extensions, late-loaded viz.
2. **Parametric rebuild** — `.cadompart` feature history executed by the **OpenCAD B-Rep kernel (K3)**.

Neither is a second-class add-on for a **Complete** OpenCAD product.

---

## 2. Truth model (B3′ files + K3 runtime)

| Concern | Truth |
|---------|--------|
| Design intent | `.cadompart` |
| Exact solid (runtime) | **OpenCAD kernel** rebuild of cadompart |
| Exact solid (**dead** / exchange / metrology / archive) | **`.cadombrep`** — frozen B-Rep snapshot produced by the kernel |
| Exchange / viz without kernel | `.cadomesh` (and optionally glTF/GLB) under role `MESH` |
| STEP / AP242 | **Out of the OpenCAD truth model** — import sas only; never normative exact |

**B3′:** viz without kernel = cadomesh. Exact *runtime* = kernel. Exact *persisted exchange* = `.cadombrep` (dead envelope). STEP is not OpenCAD exact.  
**K3:** the OpenCAD product **MUST** specify and ship a B-Rep kernel component (not “any external OCCT behind the SDK” as an afterthought). The kernel **MUST** be able to export `.cadombrep` and `.cadomesh` from a rebuild (when those writers exist).

### Profiles

| Profile | Required |
|---------|----------|
| **Graph** | Valid `.cadom` |
| **Viz** | Graph + `MESH` (cadomesh / glTF) |
| **Design** | Graph + `PARAMETRIC` + **OpenCAD kernel** |
| **Complete** | Graph + `PARAMETRIC` + `MESH` + **`EXACT` (`.cadombrep`)** + kernel to refresh mesh and brep |

A `.cadom` document alone **MAY** be valid as a graph. A **Complete OpenCAD product** **MUST** provide parametric intent, display mesh, and **dead exact B-Rep** on part occurrences that claim geometric completeness.

---

## 3. Fil rouge (canonical wording)

> OpenCAD carries two co-primary capabilities: assembly orchestration (`.cadom`) and parametric rebuild (`.cadompart`) on the **OpenCAD B-Rep kernel**.  
> Intent lives in **cadompart**; exactness at runtime lives in the **kernel**; exactness for exchange, metrology, and archive lives in **`.cadombrep`** (dead B-Rep).  
> Kernel-free visualization uses **cadomesh**.  
> A **Complete** OpenCAD product binds graph + parametric + mesh + cadombrep.  
> STEP/AP242 are not part of the OpenCAD truth model.

---

## 4. Rebuild scope (agile)

- **Required** engine (first badge): sketch (base constraints) + extrude, revolve, hole, boolean.
- Method: **TDD**, mass golden tests (`cadompart` → kernel solid → `cadomesh` / `.cadombrep` asserts).
- Broader catalogue in cadompart remains **exchange vocabulary**; not a conformance claim until badges grow.
- Expressions: forbidden until a versioned dialect exists.
- `default_active_layers` on `.cadom`: **kept** (exchangeable default override view).

---

## 5. Kernel (K3) — intent for specification

Normative kernel work (separate specs / packages, later issues) **MUST** cover:

1. Component identity: OpenCAD Kernel (versioning, API surface concept).
2. Geometric domain for Required features (solids, tolerances policy).
3. Stable entity id scheme for faces/edges used by later features **and** by `.cadombrep`.
4. Tessellation export to `.cadomesh`.
5. **Dead B-Rep export to `.cadombrep`** (B2 / #55).
6. Distribution as an OpenCAD product dependency (licence/dep choice documented when selected).

Until the kernel package exists, cadompart §11.4 points here: **reference engine = OpenCAD Kernel (K3)**; implementation may bootstrap on OCCT but the **product contract** is OpenCAD’s kernel, not “bring your own”.

---

## 6. Roadmap alignment

| Track | Content |
|-------|---------|
| Spec hygiene | Purge STEP-as-truth; align fil rouge (#51) |
| Dead exact | `.cadombrep` stub + Complete MUST EXACT (#55) |
| Kernel backlog | [`sprint-kernel-k3.md`](sprint-kernel-k3.md) |
| P1 assembly | `.cadomz`, occurrence PLM, multi-reps, mates as extension — still accepted |
| P3 viz | Face groups / LOD; CAD-friendly cadomat defaults — accepted; PMI without AP242 |

---

## 7. Proto / role note

- `AssetKind.CADOMBREP` + role `EXACT` **are** part of the OpenCAD truth model for **Complete** (dead envelope).
- `AssetKind.STEP` remains **LEGACY** on the wire for round-trip only. OpenCAD writers **MUST NOT** emit STEP as product truth; normative prose **MUST NOT** present STEP as OpenCAD exact geometry.
- Binding `EXACT` → `STEP` **MUST NOT** be written by OpenCAD product writers; readers **MAY** warn and still round-trip.
