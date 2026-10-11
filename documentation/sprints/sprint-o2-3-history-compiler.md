# Sprint O2-3 — Minimal history compiler

Branche: `feature/o2-3-history-compiler`.

## But

Extraire un compilateur d’historique Session-free : param / rectangle / cotes / extrude / fillet → `KernelBatchOp[]`.

## Livrables

- `compilerHistorique` + DTO `OperationKernel`
- `opsFillet` (parité éditeur)
- Golden bbox vs `rebuildExtrudeFromRectangle`

## Hors scope

Révolution, enlever, barrettes carrure, consommation éditeur.
