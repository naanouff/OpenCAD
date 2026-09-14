# Example — single triangle `.cadomesh`

*Informative logical document (not binary Protobuf).*

```yaml
version_major: 0
version_minor: 0
name: "unit-triangle"
units: METRES
up_axis: Y
topology: TRIANGLES
positions:
  # three vertices (XYZ)
  - [0.0, 0.0, 0.0]
  - [1.0, 0.0, 0.0]
  - [0.0, 1.0, 0.0]
normals:
  - [0.0, 0.0, 1.0]
  - [0.0, 0.0, 1.0]
  - [0.0, 0.0, 1.0]
uvs:
  - [0.0, 0.0]
  - [1.0, 0.0]
  - [0.0, 1.0]
indices: [0, 1, 2]
```

Packed `positions` length = 9; `normals` length = 9; `uvs` length = 6; `indices` length = 3.
