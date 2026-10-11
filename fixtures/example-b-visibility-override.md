# Example B — Visibility override

Same base graph as [Example A](example-a-three-level-assembly.md), plus one override.

Active layers (session): `["review"]`

```yaml
# ... same version, units, up_axis, root_ids, assets, nodes as Example A ...
overrides:
  - node_id: "33333333-3333-3333-3333-333333333333"  # Part A
    layer: "review"
    visible: false
    # material_ref unset → does not patch material
    # local_transform empty → does not patch transform
```

**Resolved view** with `review` active: Part A `visible = false`; Part B unchanged; base node records and GLB files untouched.
