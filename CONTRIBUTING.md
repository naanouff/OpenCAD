# Contributing

OpenCAD is open source (MIT). Please follow the workflow below.

**Full rules:** [documentation/contribution-rules.md](documentation/contribution-rules.md)

## Quick rules

1. **No direct commits** on `main` or `develop`.
2. Work on `feature/<title>` or `fix/<title>`, then open a **PR into `develop`**.
3. **`main`** only advances via **PR from `develop`** (release).
4. Every **commit** must be **atomic**, linked to an **issue**, with a **message and description**.
5. Every **issue** must spell out **DOR** and **DOD**.
6. When writing **code**: only after the [native asset spec gate](documentation/sprint-native-assets.md); then **TDD** is mandatory; follow **DRY**, **KISS**, and **YAGNI**.

## Specs

Normative format docs live in [`documentation/specification/`](documentation/specification/).

## Start work

```bash
git fetch origin
git checkout develop
git pull origin develop
git checkout -b feature/my-feature-title
```

Open or refine a GitHub issue (use the issue template), then commit with:

```text
type: short summary (#123)

Why / what in a few sentences.
Réf. #123
```

Open a PR targeting `develop` and reference `Closes #123`.
