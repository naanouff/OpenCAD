# Example — facing and contour `.cadomfab`

*Informative logical document (not binary Protobuf).* One setup, one end mill, a facing feed, and two adjustable parameters. Units: millimetres.

```yaml
version_major: 0
version_minor: 0
name: "plate-face"
units: MILLIMETRES
up_axis: Z
stock:
  box: { size_x: 120, size_y: 80, size_z: 12 }
tools:
  - id: "tool-em10"
    name: "EM10"
    kind: END_MILL
    diameter: 10
    corner_radius: 0
    flute_length: 25
setups:
  - id: "setup-top"
    name: "top vise"
    part_to_setup: []   # identity
    fixture: "vise on datum A"
operations:
  - id: "op-face"
    name: "face"
    setup_id: "setup-top"
    tool_id: "tool-em10"
    motions:
      - kind: RAPID
        points: [{ x: 0, y: 0, z: 30 }, { x: -10, y: -10, z: 12 }]
      - kind: FEED
        points: [{ x: -10, y: -10, z: 10 }, { x: 130, y: 90, z: 10 }]
parameters:
  - id: "wear-em10"
    name: "EM10 length wear"
    target: TOOL
    target_id: "tool-em10"
    quantity: TOOL_LENGTH_WEAR
    nominal: 0
  - id: "shift-z"
    name: "top setup Z"
    target: SETUP
    target_id: "setup-top"
    quantity: SETUP_SHIFT_Z
    nominal: 0
```
