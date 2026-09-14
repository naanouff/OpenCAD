# Example C — Pass-through extension

Same base graph as [Example A](example-a-three-level-assembly.md). A kinematics vendor blob is attached.

```yaml
# ... same version, units, up_axis, root_ids, assets, nodes as Example A ...
overrides: []
extensions:
  - vendor: "com.example"
    type: "kinematics.v1"
    # payload shown as base64 for documentation only
    payload_base64: "AGV4YW1wbGUta2luZW1hdGljcy1ibG9i"
```

A reader that does not understand `com.example` / `kinematics.v1` **MUST** still rewrite the same `vendor`, `type`, and payload bytes on save after unrelated edits (e.g. renaming a node).
