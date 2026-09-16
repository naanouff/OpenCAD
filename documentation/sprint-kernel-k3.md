# Sprint backlog — OpenCAD Kernel (K3)

**Status:** process backlog  
**Doctrine:** [`opencad-doctrine.md`](opencad-doctrine.md) (B3′)  
**Issue seeds:** [#51](https://github.com/naanouff/OpenCAD/issues/51), [#55](https://github.com/naanouff/OpenCAD/issues/55)

## Goal

Ship an **OpenCAD B-Rep kernel** as a first-class product component that rebuilds Required `.cadompart` features under TDD and mass golden tests, tessellates to `.cadomesh`, and exports dead exact `.cadombrep`.

## Out of scope (first kernel badge)

- Full industrial catalogue (fillet/shell/draft/…)
- Expression dialect
- Native analytic `OPENCAD_NATIVE` B-Rep encoding (bootstrap `OCCT_BREP` OK)
- STEP import/export as truth
- Assembly mates solver

## Suggested issues (create when starting work)

| ID | Title | Notes |
|----|-------|-------|
| K3-0 | Spec stub `opencad-kernel-v0.md` | Scope, versioning, non-goals, link to cadompart Required |
| K3-1 | Choose implementation base | e.g. OCCT wrap vs other — document licence |
| K3-2 | Package skeleton + CI | Monorepo package, TDD harness |
| K3-3 | Extrude golden corpus | cadompart → solid → mesh asserts |
| K3-4 | Revolve + hole + boolean | Same harness |
| K3-5 | Sketch constraints (Required set) | Fail explicit on over-constrain |
| K3-6 | Id scheme faces/edges | Stable enough for fillet work **and** cadombrep topo lists |
| K3-7 | Tessellate → `.cadomesh` writer | Viz path; provenance fields — SWOT P0-K.4 |
| K3-8 | Export → `.cadombrep` writer | Dead exact; provenance + `OCCT_BREP` bootstrap — #55 |

## Conformance badges

| Badge | Requirement |
|-------|-------------|
| **OpenCAD Kernel Required v0** | K3-3…K3-5 and K3-7 pass published goldens |
| **OpenCAD Kernel Complete export v0** | Required badge **plus** K3-8 (cadombrep with provenance) |

Complete **product** claims (doctrine) need the Complete export badge.
