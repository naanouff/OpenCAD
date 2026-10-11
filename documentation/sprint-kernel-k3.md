# Sprint backlog — OpenCAD Kernel (K3)

**Status:** process backlog  
**Doctrine:** [`opencad-doctrine.md`](opencad-doctrine.md) (B3′)  
**Issue seeds:** [#51](https://github.com/naanouff/OpenCAD/issues/51), [#55](https://github.com/naanouff/OpenCAD/issues/55)

## Goal

Ship an **OpenCAD B-Rep kernel** as a first-class product component that rebuilds Required `.cadompart` features under TDD and mass golden tests, tessellates to `.cadomesh`, and exports dead exact `.cadombrep`.

## Out of scope (first kernel badge)

- Full industrial catalogue (fillet/shell/draft/…)
- Expression dialect beyond `opencad.expr.v0` (shipped O1)
- Native analytic `OPENCAD_NATIVE` B-Rep encoding (bootstrap `OCCT_BREP` OK)
- STEP import/export as truth
- Assembly mates solver

## Suggested issues (create when starting work)

| ID | Title | Notes |
|----|-------|-------|
| K3-0 | Spec stub `opencad-kernel-v0.md` | **Done** (#57) — [`specification/opencad-kernel-v0.md`](specification/opencad-kernel-v0.md) |
| K3-1 | Choose implementation base | **Done** (#57) — bootstrap `occt-kernel` / OCCT LGPL-2.1 |
| K3-2 | Package skeleton + CI | **Done** (#59) — `@opencad/kernel` + Vitest + Actions |
| K3-3 | Extrude golden corpus | **Done** (#61) — plate golden via `make_box` + tessellate |
| K3-4 | Revolve + hole + boolean | **Done** (#63) — revolve cylinder + plate hole cut |
| K3-5 | Sketch constraints (Required set) | **Done** (#65) — rectangle H/V/distance ; sous/sur fail |
| K3-6 | Id scheme faces/edges | **Done** (#67) — `face:{i}` / `edge:{i}` snapshot ids |
| K3-7 | Tessellate → `.cadomesh` writer | **Done** (#69) — `ecrireCadomesh` / `lireCadomesh` |
| K3-8 | Export → `.cadombrep` writer | **Done** (#71) — provenance + topo + `OCCT_BREP` |

## Conformance badges

| Badge | Requirement |
|-------|-------------|
| **OpenCAD Kernel Required v0** | K3-3…K3-5 and K3-7 pass published goldens |
| **OpenCAD Kernel Complete export v0** | Required badge **plus** K3-8 (cadombrep with provenance) |

Complete **product** claims (doctrine) need the Complete export badge.
