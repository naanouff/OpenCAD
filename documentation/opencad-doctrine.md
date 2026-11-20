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
| Nominal manufacturing process | `.cadomfab` — stock, tools, setups, neutral instruction program (dialect not defined yet), adjustable parameters |
| Control adjustments | `.cadomctrl` — values for parameters declared by `.cadomfab`; does not edit the gamme |
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
| **Control** | Graph + `EXACT` + **`CONTROL` (`.cadomctrl`)** on occurrences that publish inspection feedback |
| **Manufacturing** | Graph + `EXACT` + **`MANUFACTURING` (`.cadomfab`)** |

A `.cadom` document alone **MAY** be valid as a graph. A **Complete OpenCAD product** **MUST** provide parametric intent, display mesh, and **dead exact B-Rep** on part occurrences that claim geometric completeness.

**Control** measures the dead exact solid and writes adjustment values. It **MUST NOT** rewrite the gamme. **Manufacturing** declares the nominal process and the adjustable parameter ids. A consumer that has both bindings on a node **MUST** apply `.cadomctrl` values over `.cadomfab` nominals before showing or replaying steps from stock to the finished `EXACT`. Neither profile is a subset of Complete. Specs: [`specification/cadomfab-v0.md`](specification/cadomfab-v0.md), [`specification/cadomctrl-v0.md`](specification/cadomctrl-v0.md). Material-removal simulation is a later consumer of those files, not part of the v0 schema.

---

## 3. Fil rouge (canonical wording)

> OpenCAD carries two co-primary capabilities: assembly orchestration (`.cadom`) and parametric rebuild (`.cadompart`) on the **OpenCAD B-Rep kernel**.  
> Intent lives in **cadompart**; exactness at runtime lives in the **kernel**; exactness for exchange, metrology, and archive lives in **`.cadombrep`** (dead B-Rep).  
> Kernel-free visualization uses **cadomesh**.  
> A **Complete** OpenCAD product binds graph + parametric + mesh + cadombrep.  
> **Manufacturing** binds a nominal gamme (`.cadomfab`). **Control** binds adjustments (`.cadomctrl`) for parameter ids that gamme declared, without editing it.  
> STEP/AP242 are not part of the OpenCAD truth model.

---

## 4. Rebuild scope (agile)

- **Required** engine (first badge): sketch (base constraints) + extrude, revolve, hole, boolean.
- Method: **TDD**, mass golden tests (`cadompart` → kernel solid → `cadomesh` / `.cadombrep` asserts).
- Broader catalogue in cadompart remains **exchange vocabulary**; not a conformance claim until badges grow.
- Expressions: allowed when `expression_dialect` is declared (`opencad.expr.v0` — [`specification/cadompart-expression-v0.md`](specification/cadompart-expression-v0.md)).
- `default_active_layers` on `.cadom`: **kept** (exchangeable default override view).

---

## 5. Kernel (K3) — intent for specification

Normative kernel work (separate specs / packages, later issues) **MUST** cover:

1. Component identity: OpenCAD Kernel (versioning, API surface concept).
2. Geometric domain for Required features (solids, tolerances policy).
3. Stable entity id scheme for faces/edges used by later features **and** by `.cadombrep`.
4. Tessellation export to `.cadomesh`.
5. **Dead B-Rep export to `.cadombrep`** (B2 / #55).
6. Distribution as an OpenCAD product dependency — **K3-1 decided** ([`specification/opencad-kernel-v0.md`](specification/opencad-kernel-v0.md)): bootstrap **`occt-kernel`** (`@naanouff/occt-wasm`); OCCT **LGPL-2.1**.

`@opencad/kernel` exists on `develop` (K3-2…K3-8 and O2-1…O2-15). cadompart §11.4 points here: **reference engine = OpenCAD Kernel (K3)**; bootstrap on OCCT is documented; the **product contract** remains OpenCAD’s kernel, not “bring your own”. The package rebuilds a history DTO and golden intents; it does not yet decode `.cadompart` bytes.

---

## 6. Roadmap alignment

| Track | Content |
|-------|---------|
| Spec hygiene | Purge STEP-as-truth; align fil rouge (#51) |
| Dead exact | `.cadombrep` stub + Complete MUST EXACT (#55) |
| Kernel | K3-0…K3-8 **done** on `develop` — [`sprint-kernel-k3.md`](sprint-kernel-k3.md); graph SDK O4 **done** — `@opencad/cadom` |
| P1 assembly | `.cadomz`, occurrence PLM, multi-reps, mates as extension — still accepted |
| P3 viz | Face groups / LOD; CAD-friendly cadomat defaults — accepted; PMI without AP242 |
| Control / Manufacturing | Spec v0 **done** (#97): `.cadomfab` + `.cadomctrl`. Removal simulation not started |

---

## 7. Proto / role note

- `AssetKind.CADOMBREP` + role `EXACT` **are** part of the OpenCAD truth model for **Complete** (dead envelope).
- `AssetKind.CADOMFAB` + role `MANUFACTURING`, and `AssetKind.CADOMCTRL` + role `CONTROL`, are the process loop (#97). They are not geometry truth. Writers **MUST NOT** put the gamme or the adjustments in an `Extension` or in STEP.
- `AssetKind.STEP` remains **LEGACY** on the wire for round-trip only. OpenCAD writers **MUST NOT** emit STEP as product truth; normative prose **MUST NOT** present STEP as OpenCAD exact geometry.
- Binding `EXACT` → `STEP` **MUST NOT** be written by OpenCAD product writers; readers **MAY** warn and still round-trip.
