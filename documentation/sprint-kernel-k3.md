# Sprint backlog — OpenCAD Kernel (K3)

**Status:** process backlog  
**Doctrine:** [`opencad-doctrine.md`](opencad-doctrine.md)  
**Issue seed:** [#51](https://github.com/naanouff/OpenCAD/issues/51)

## Goal

Ship an **OpenCAD B-Rep kernel** as a first-class product component that rebuilds Required `.cadompart` features under TDD and mass golden tests, and tessellates to `.cadomesh`.

## Out of scope (first kernel badge)

- Full industrial catalogue (fillet/shell/draft/…)
- Expression dialect
- Persisted native B-Rep file format (possible later B2)
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
| K3-6 | Id scheme faces/edges | Stable enough for later fillet work |
| K3-7 | Tessellate → `.cadomesh` writer | B3 viz path |

## Conformance badge (first)

An implementation **MAY** claim **OpenCAD Kernel Required v0** only if K3-3…K3-5 (+ tessellation) pass the published golden set.
