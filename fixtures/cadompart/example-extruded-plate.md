# Example — extruded plate `.cadompart` v0.1

*Informative logical document (not binary Protobuf).*

Ordered history: sketch rectangle → extrude solid.

```yaml
version_major: 0
version_minor: 1
name: "plate"
units: METRES
up_axis: Y
parameters:
  - id: "p-w"
    name: "Width"
    type: FLOAT
    float_value: 0.12
  - id: "p-d"
    name: "Depth"
    type: FLOAT
    float_value: 0.08
  - id: "p-h"
    name: "Thickness"
    type: FLOAT
    float_value: 0.01
features:
  - id: "f-sketch"
    name: "Base profile"
    parameter_ids: ["p-w", "p-d"]
    sketch:
      origin: { x: 0, y: 0, z: 0 }
      x_axis: { x: 1, y: 0, z: 0 }
      y_axis: { x: 0, y: 0, z: 1 }
      curves:
        - line: { a: { x: 0, y: 0 }, b: { x: 0.12, y: 0 } }
        - line: { a: { x: 0.12, y: 0 }, b: { x: 0.12, y: 0.08 } }
        - line: { a: { x: 0.12, y: 0.08 }, b: { x: 0, y: 0.08 } }
        - line: { a: { x: 0, y: 0.08 }, b: { x: 0, y: 0 } }
  - id: "f-extrude"
    name: "Pad"
    parameter_ids: ["p-h"]
    extrude:
      profile_sketch_id: "f-sketch"
      distance: 0.01
      symmetric: false
      direction: { x: 0, y: 1, z: 0 }
      cut: false
```

A conforming rebuild engine produces a rectangular plate 120×80×10 mm in metres.
