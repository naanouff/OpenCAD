# Règles de contribution — OpenCAD / CADOM

Ces règles s’appliquent à tout le dépôt (humain et agents). Elles priment sur les habitudes locales.

## Branches

| Branche | Rôle | Commits directs |
|---------|------|-----------------|
| `main` | Releases uniquement | **Interdit** |
| `develop` | Intégration / travail consolidé | **Interdit** |
| `feature/<titre>` | Une feature = une branche | Autorisés (liés à une issue) |
| `fix/<titre>` | Un correctif = une branche | Autorisés (liés à une issue) |

### Flux

```text
feature/* ou fix/*
        │
        ▼  Pull Request (revue)
    develop
        │
        ▼  Pull Request de release
      main
```

- Aucun push / commit sur `main` ou `develop`.
- `main` n’avance que via **PR depuis `develop`** (release).
- `develop` n’avance que via **merge de PR** depuis `feature/*` ou `fix/*`.
- Nom de branche : `feature/titre-de-la-feature` ou `fix/titre-du-fix` (kebab-case, sans espaces).

### Exemples

```text
feature/spec-scaffold-docs
feature/cadom-proto-draft
fix/spec-transform-matrix-typo
```

## Issues — DOR et DOD obligatoires

Toute issue **doit** exposer explicitement :

### Definition of Ready (DOR)

L’issue est prête à être prise seulement si :

- [ ] Objectif clair (une phrase)
- [ ] Périmètre / hors scope écrits
- [ ] Dépendances connues (issues ou décisions bloquantes)
- [ ] Critères de succès compréhensibles sans contexte oral
- [ ] Labels et milestone renseignés si applicable

### Definition of Done (DOD)

L’issue est terminée seulement si :

- [ ] Livrables listés tous cochés
- [ ] PR mergée dans `develop` (pas seulement du code local)
- [ ] Commits atomiques, chacun lié à cette issue
- [ ] Documentation / spec mise à jour si le sujet l’exige
- [ ] Pas de régression connue sur le périmètre de l’issue

### Template minimal du corps d’issue

```markdown
## Objectif
…

## Périmètre
…

## Hors scope
…

## DOR
- [ ] …
- [ ] …

## Livrables
- [ ] …

## DOD
- [ ] …
- [ ] …
```

## Commits

### Obligatoire

1. **Lié à une issue** — référence dans le sujet : `(#123)` ou `Fixes #123` / `Closes #123` quand le commit clôture.
2. **Message** — résumé court du *pourquoi* / du changement (impératif, ≤ ~72 caractères pour la 1ʳᵉ ligne).
3. **Description** — corps du commit (après une ligne vide) : contexte, détails, lien issue si besoin.
4. **Atomique** — un commit = un changement cohérent et revertable seul. Pas de « WIP fourre-tout ».

### Format

```text
<type>: <résumé court> (#<issue>)

<description en 1–5 phrases>
Ce que le commit change et pourquoi.
Réf. #<issue>
```

Types usuels : `feat`, `fix`, `docs`, `chore`, `test`, `refactor`.

### Exemple

```text
docs: add contribution branch and commit rules (#12)

Introduce DOR/DOD requirements for issues and forbid
direct commits on main and develop.

Réf. #12
```

### Interdit

- Commit sans numéro d’issue
- Commit sans corps (description) quand le changement n’est pas trivial
- Commit mélangeant plusieurs sujets sans lien (non atomique)
- Commit / push sur `main` ou `develop`

## Pull requests

### Feature / fix → `develop`

- Base : `develop`
- Titre clair ; corps : résumé, issue liée (`Closes #N`), checklist DOD
- Une PR ≈ une issue (sauf epic découpé explicitement)

### Release → `main`

- Base : `main`, head : `develop`
- Uniquement pour figer une release ; notes de version dans la description

## Récap agent / contributeur

1. Créer ou prendre une issue **avec DOR/DOD**.
2. Brancher depuis `develop` : `feature/...` ou `fix/...`.
3. Commits atomiques liés à l’issue (message + description).
4. Ouvrir une PR vers `develop` ; merger uniquement via PR.
5. Ne jamais committer sur `main` / `develop`.
