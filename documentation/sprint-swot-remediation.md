# Sprint backlog — SWOT remediations (post v0.3.1)

**Status:** process backlog (non-normative) — kernel and graph SDK **landed on `develop`** (2026-10-11); P1/P3 and P0-K.4 still open  
**Current analysis:** [cadom-spec-swot.md](cadom-spec-swot.md) (SWOT-2, #53, plus the 2026-11-20 progress note)  
**Product doctrine (wins on conflict):** [opencad-doctrine.md](opencad-doctrine.md)  
**Done:** P0 hygiene (#49) · Doctrine B3+K3 / purge STEP-as-truth (#51) · **B3′ + cadombrep stub (#55)** · **Kernel K3-2…K3-8** ([sprint-kernel-k3.md](sprint-kernel-k3.md)) · **O2-1…O2-15** · **Graph SDK O4-1…O4-3** (`@opencad/cadom`) · writer lint P0-K.5

Items below remain useful for **P1/P3** and **P0-K.4**. P2 STEP-as-truth is **superseded** by doctrine. A **Complete** product still needs parametric + mesh + **cadombrep**; those writers exist in `@opencad/kernel` on `develop`. `main` does not include them past O2-5 (PR #80).

---

## P0-K — Kernel blockers (see also sprint-kernel-k3)

| ID | Item | Notes |
|----|------|-------|
| P0-K.4 | Tessellation provenance on `.cadomesh` | **Open.** `cadomesh.proto` has no `kernel_id`, `kernel_version`, or source hash. K3-7 writer ships mesh bytes only |
| P0-K.5 | Writer lint anti-STEP/EXACT + import-as-sas note | **Done** on `develop` — `lintWriterTruth` in `@opencad/cadom` (O4-3) |
| P0-K.6 | Align `native-assets-v0-freeze.md` | **Done** — freeze note points at shipped kernel + SDK; cadompart spec is v0.3 |

---

## P1 — Product completeness (target ~v0.4)

| ID | Item | Notes |
|----|------|-------|
| P1.1 | Occurrence PLM fields on `Node` | `instance_name`, `part_number`, `revision`, optional `definition_id` |
| P1.2 | Multi-representations per role | DESIGN / VIZ / ENVELOPE (relax “one asset per role” or add purpose enum) |
| P1.3 | `.cadomz` container | Zip of `.cadom` + companions; relative URIs |
| P1.4 | Richer overrides | `suppressed`, instance color, representation purpose (align SWOT-2) |
| P1.5 | Writer profile Z-up / mm | Documented CATIA/NX/Creo export profile (partially started in CADOM §2.1) |
| P1.5b | cadompart default units/up-axis SHOULD | Align mechanical writers: mm + Z-up (today §3 defaults m / Y-up) |
| P1.6 | Reserved `opencad.*` cadometa keys | Part number, mass, etc. |
| P1.7 | Assembly mates | Start as **vendor Extension**; promote later if stable |
| P1.f64 | Optional `local_transform_f64` | After kernel badge; see CADOM §2.3.1 |

## P2 — Remaining cadompart engineering

| ID | Item | Notes |
|----|------|-------|
| P2-comm | Catalogue §8 banner / annex | Recommended ≠ rebuild conformance claim |
| P2.x | Geometric selectors for fillet/shell | Point + direction / nearest — after K3-6 |
| P2.x | Published **OpenCAD Kernel** reference profile | **Partial.** Identity, licence, and snapshot ids shipped ([opencad-kernel-v0.md](specification/opencad-kernel-v0.md), K3-6). Numeric tolerances still TBD |
| P2.x | Expression dialect | **Done** (O1, #57) — `opencad.expr.v0` |

## P3 — Mesh / material polish

| ID | Item | Notes |
|----|------|-------|
| P3.1 | cadomesh face/body groups + LOD | PMI face anchors later |
| P3.2 | cadomat CAD-friendly defaults | metallic ≈ 0, roughness ≈ 0.4 for painted metals |
| P3.3 | cadomesh units mm | Proto already additive; keep prose aligned |
| P3.4 | PMI | Do **not** specify yet; future mesh/kernel face ids (no AP242-as-truth) |

## Sequencing reminder

1. Doctrine + purge STEP-as-truth (#51) — done.  
2. Graph SDK decode/encode and **OpenCAD Kernel Required** badge — done on `develop` (O4, K3-3…K3-8). Not on `main` past O2-5.  
3. P0-K.4 tessellation provenance, then P1 container / occurrence when packing real assemblies. Helix (W1) stays outside the Required badge.
