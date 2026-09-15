# Example — plate with hole and fillet (cadompart v0.2)

*Informative.* Demonstrates sketch (with inner loop omitted — hole feature used instead), extrude, hole, fillet edge set.

```yaml
version_major: 0
version_minor: 2
name: "plate-with-hole"
units: METRES
up_axis: Y
parameters:
  - id: "p-thick"
    name: "Thickness"
    type: FLOAT
    float_value: 0.008
  - id: "p-hole-d"
    name: "Hole diameter"
    type: FLOAT
    float_value: 0.01
  - id: "p-fillet-r"
    name: "Fillet radius"
    type: FLOAT
    float_value: 0.002
datum_planes:
  - id: "xy"
    name: "Front"
    origin: { x: 0, y: 0, z: 0 }
    normal: { x: 0, y: 1, z: 0 }
features:
  - id: "sk1"
    name: "Outline"
    sketch:
      datum_plane_id: "xy"
      origin: { x: 0, y: 0, z: 0 }
      x_axis: { x: 1, y: 0, z: 0 }
      y_axis: { x: 0, y: 0, z: 1 }
      curves:
        - line: { id: "l1", a: { x: 0, y: 0 }, b: { x: 0.1, y: 0 } }
        - line: { id: "l2", a: { x: 0.1, y: 0 }, b: { x: 0.1, y: 0.06 } }
        - line: { id: "l3", a: { x: 0.1, y: 0.06 }, b: { x: 0, y: 0.06 } }
        - line: { id: "l4", a: { x: 0, y: 0.06 }, b: { x: 0, y: 0 } }
      constraints:
        - id: "c-h1"
          kind: HORIZONTAL
          curve_indices: [0]
        - id: "c-h2"
          kind: HORIZONTAL
          curve_indices: [2]
        - id: "c-v1"
          kind: VERTICAL
          curve_indices: [1]
        - id: "c-v2"
          kind: VERTICAL
          curve_indices: [3]
  - id: "ex1"
    name: "Pad"
    parameter_ids: ["p-thick"]
    extrude:
      profile_sketch_id: "sk1"
      end_condition: BLIND
      distance: 0.008
      direction: { x: 0, y: 1, z: 0 }
      cut: false
      merge: true
  - id: "h1"
    name: "Center hole"
    parameter_ids: ["p-hole-d"]
    hole:
      hole_type: SIMPLE
      position: { x: 0.05, y: 0.008, z: 0.03 }
      axis: { x: 0, y: -1, z: 0 }
      diameter: 0.01
      depth: 0.008
      end_condition: THROUGH_ALL
  - id: "f1"
    name: "Outer fillets"
    parameter_ids: ["p-fillet-r"]
    fillet:
      tangent_propagate: true
      sets:
        - radius: 0.002
          edges:
            - id: "fex1.e0"
            - id: "fex1.e1"
            - id: "fex1.e2"
            - id: "fex1.e3"
```
