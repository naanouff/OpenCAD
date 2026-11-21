# openCAD graphic charter

Source: [planche-identite.svg](planche-identite.svg) (vector board for openCAD, Editor & TEAM). Raster preview: [planche-identite-opencad-editor.png](planche-identite-opencad-editor.png).

Symbols in [kit/](kit/) are **extracted from the board** (`icon-opencad-std`, light and mini variants). Do not redraw.

## Logo (openCAD)

| Element | Spec |
|---------|------|
| Icon | Cyan B-Rep cube, hollow nodes, dashed back edges |
| Wordmark | **open** (slate) + **CAD** (cyan `#22D3EE`) |
| On light backgrounds | [wordmark-opencad-light](kit/svg/wordmark-opencad-light.svg) / [icon-opencad-std](kit/svg/icon-opencad-std.svg) |
| On dark backgrounds | [wordmark-opencad-dark](kit/svg/wordmark-opencad-dark.svg) / [icon-opencad-std-light](kit/svg/icon-opencad-std-light.svg) |

Clear space: keep at least half the icon width around the mark. Do not recolor the cyan cube or stretch the wordmark.

## Palette

| Role | Hex | Usage |
|------|-----|--------|
| Navy | `#0E1423` | Dark surfaces, wordmark slate |
| Panel dark | `#151C2E` | Panels / chrome |
| Brand cyan | `#22D3EE` | Primary accent, **CAD**, icon strokes |
| UI cyan | `#00B8D9` | Focus / borders (contrast) |
| Light text | `#E8EEF7` | Text on navy |
| Muted text | `#8B9BB8` | Secondary |
| Light ground | `#F4F7FB` | Light theme paper |
| Dark text | `#0E1423` | Text on light |

## Sibling brands (not packaged here)

| Product | Accent | Role |
|---------|--------|------|
| openCAD Editor | Amber `#F59E0B` (Sketch mode / Editor word) | Desktop / web editor UI |
| openCAD TEAM | Emerald `#10b981` | Team product mark |

Full Editor / TEAM / Sketch asset kits and UI design tokens: [OpenCadEditor `documentation/graphique`](https://github.com/naanouff/OpenCadEditor).

## Files

Lean kit for this repo: [kit/](kit/) — openCAD SVG sources plus representative PNG/WebP (icon 512, wordmark w600).
