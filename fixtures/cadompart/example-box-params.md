# Example — parametric box `.cadompart`

*Informative logical document (not binary Protobuf).*

```yaml
version_major: 0
version_minor: 0
name: "box-part"
parameters:
  - id: "p-width"
    name: "Width"
    type: FLOAT
    float_value: 0.12
    unit: "m"
  - id: "p-depth"
    name: "Depth"
    type: FLOAT
    float_value: 0.08
    unit: "m"
  - id: "p-height"
    name: "Height"
    type: FLOAT
    float_value: 0.04
    unit: "m"
  - id: "p-fillet"
    name: "Enable fillet"
    type: BOOL
    bool_value: true
features:
  - id: "f-body"
    type: "box"
    name: "Main body"
    parameter_ids: ["p-width", "p-depth", "p-height"]
  - id: "f-edge"
    type: "fillet"
    name: "Edge fillet"
    parameter_ids: ["p-fillet"]
```
