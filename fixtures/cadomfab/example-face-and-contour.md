# Example — facing and contour `.cadomfab`

*Informative logical document (not binary Protobuf).* One setup, one end mill, an operation whose instruction program is empty (dialect not defined), and two adjustable parameters. Units: millimetres.

```yaml
version_major: 0
version_minor: 0
name: "plate-face"
units: MILLIMETRES
up_axis: Z
tools:
  - id: "tool-em10"
    name: "EM10"
    kind: END_MILL
    diameter: 10
    corner_radius: 0
    flute_length: 25
variants:
  - id: "gamme-face"
    name: "face from bar"
    # Empty = not resolved yet. Not an identity matrix.
    product_to_machine: []
    stock:
      frame: []   # unresolved placement in the product frame
      box: { size_x: 120, size_y: 80, size_z: 12 }
    setups:
      - id: "setup-top"
        name: "top vise"
        machine_to_setup: []   # unresolved; axes follow the user methodology
        fixture: "vise on datum A"
    operations:
      - id: "op-face"
        name: "face"
        setup_id: "setup-top"
        tool_id: "tool-em10"
        # Dialect not defined yet. Bytes stay empty; do not embed G-code.
        instruction_dialect: "opencad.fab.instr.unspecified"
        instructions: []
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
