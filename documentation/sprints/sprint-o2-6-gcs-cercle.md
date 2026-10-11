# Sprint O2-6 — GCS cercle + polylines densifiées

Branche: `feature/o2-6-gcs-cercle`.

## But

Extraire la résolution cercle (diamètre / contrainte rayon) et la densification wire, alignées éditeur `solveurGcs` / `esquissePolylines`.

## Livrables

- `CercleEsquisse` + `resoudreCercle` dans `sketchSolve`
- `polylinesDepuisResolue` densifie les cercles (polyline 1 point)
- Compiler : extrude / enlever via GCS cercle ; anneau multi-cercles

## Hors scope

Polygone régulier, profil corne, datums monde.
