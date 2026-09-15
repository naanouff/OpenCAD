# Sprint backlog — SWOT remediations (post v0.3.1)

**Status:** process backlog (non-normative)  
**Driver:** [cadom-spec-swot.md](cadom-spec-swot.md)  
**Done in #49:** P0 hygiene + P2 cadompart posture  

Items below are **not** in the v0.3.1 PR. Track as separate issues before expanding the SDK surface area carelessly.

---

## P1 — Product completeness (target ~v0.4)

| ID | Item | Notes |
|----|------|-------|
| P1.1 | Occurrence PLM fields on `Node` | `instance_name`, `part_number`, `revision`, optional `definition_id` |
| P1.2 | Multi-representations per role | DESIGN / VIZ / ENVELOPE (relax “one asset per role” or add purpose enum) |
| P1.3 | `.cadomz` container | Zip of `.cadom` + companions; relative URIs |
| P1.4 | Richer overrides | Material swap depth, layer metadata |
| P1.5 | Writer profile Z-up / mm | Documented CATIA/NX/Creo export profile (partially started in §2.1) |
| P1.6 | Reserved `opencad.*` cadometa keys | Part number, mass, etc. |
| P1.7 | Assembly mates | Start as **vendor Extension**; promote later if stable |

## P2 — Remaining cadompart engineering

| ID | Item | Notes |
|----|------|-------|
| P2.x | Geometric selectors for fillet/shell | Point + direction / nearest — after OCCT golden files |
| P2.x | Published OCCT reference profile | Version, tolerances, id scheme |
| P2.x | Expression dialect (if ever) | Numbers, `+ - * /`, `param.id` refs — versioned |

## P3 — Mesh / material polish

| ID | Item | Notes |
|----|------|-------|
| P3.1 | cadomesh face/body groups + LOD | PMI face anchors later |
| P3.2 | cadomat CAD-friendly defaults | metallic ≈ 0, roughness ≈ 0.4 for painted metals |
| P3.3 | cadomesh units mm | Proto already additive; keep prose aligned |
| P3.4 | PMI | Do **not** specify; use AP242 + future face ids |

## Sequencing reminder (from SWOT)

1. Land **v0.3.1** (this sprint) before freezing wrong semantics in the SDK.  
2. SDK decode/encode may start in parallel once EXACT + two-layer story are merged.  
3. Rebuild engine = **separate** sprint; golden files for Required features only first.
