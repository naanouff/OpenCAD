# CADOMPART expression dialect `opencad.expr.v0`

**Status:** draft (normative when declared on the file)  
**Parent:** [`cadompart-v0.md`](cadompart-v0.md) v0.3  
**Issue:** [#57](https://github.com/naanouff/OpenCAD/issues/57)

## 1. Purpose

Versioned arithmetic dialect for `Parameter.expression` and feature numeric fields that carry an expression string. Until a file declares this dialect, writers **MUST NOT** emit non-empty `expression` (cadompart §4.1 historical rule).

## 2. Declaration

`CadompartFile.expression_dialect` **MUST** be set to the string `opencad.expr.v0` when any non-empty `expression` is written.

Readers that do not implement the dialect **MUST** ignore `expression` and use typed value fields (`float_value`, …).

## 3. Grammar (v0)

After substituting parameter **names** (longest-first) with their expression strings recursively:

- Allowed characters in the reduced formula: digits, `+`, `-`, `*`, `/`, `(`, `)`, `.`, whitespace.
- Result **MUST** be a finite IEEE number.
- No functions, units suffixes, or string ops in v0.

Parameter names are the `Parameter.name` / `id` strings present on the file (editor scripts use the same identifiers).

## 4. Evaluation order

1. Build a map `name → expression` (or typed literal as decimal string) for all parameters.
2. For a target expression, replace names longest-first until no name remains or a cycle is detected (cycle **MUST** fail).
3. Evaluate the arithmetic formula.

## 5. Alignment

Matches the OpenCadEditor host evaluator (`evaluateurProvisoire`: arithmetic + parameter names only). Future dialects (`opencad.expr.v1`, …) **MAY** add functions; they **MUST** use a new dialect id.
