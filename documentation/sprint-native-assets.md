# Sprint — Native asset specs v0

Milestone: [Sprint Native Asset Specs v0](https://github.com/naanouff/OpenCAD/milestone/2)

## Gate (blocking)

**No SDK / application development** until each of the following has an **initial normative v0** spec:

| Format | Spec doc (target) | Issue |
|--------|-------------------|-------|
| `.cadom` | [cadom-v0.1.md](specification/cadom-v0.1.md) (v0.3+) | done |
| `.cadomesh` | [cadomesh-v0.md](specification/cadomesh-v0.md) | [#31](https://github.com/naanouff/OpenCAD/issues/31) — **done** |
| `.cadompart` | [cadompart-v0.md](specification/cadompart-v0.md) | [#32](https://github.com/naanouff/OpenCAD/issues/32) — **done** |
| `.cadomat` | [cadomat-v0.md](specification/cadomat-v0.md) | [#33](https://github.com/naanouff/OpenCAD/issues/33) — **done** |
| `.cadometa` | [cadometa-v0.md](specification/cadometa-v0.md) | [#34](https://github.com/naanouff/OpenCAD/issues/34) — **done** |

Gate documentation: [#35](https://github.com/naanouff/OpenCAD/issues/35).  
Final freeze before SDK: create/close checklist after NATIVE-01…04 (issue title NATIVE-05 if opened later).

Allowed before the gate lifts: specification prose, `.proto` schemas, fixtures/examples, repo process docs.

## Order

1. **cadomesh** (display mesh) — start here  
2. **cadomat** (PBR materials)  
3. **cadompart** (parametric)  
4. **cadometa** (metadata)  
5. Freeze gate → SDK sprint (TDD)
