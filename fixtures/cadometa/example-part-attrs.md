# Example — part attributes `.cadometa`

*Informative logical document (not binary Protobuf).*

```yaml
version_major: 0
version_minor: 0
name: "part-a-attrs"
entries:
  - key: "com.example.part_number"
    value: "PN-0042"
    value_type: STRING
  - key: "com.example.mass_kg"
    value: "0.245"
    value_type: NUMBER
  - key: "com.example.supplier_critical"
    value: "true"
    value_type: BOOL
opaque_payload: []  # unused
opaque_content_type: ""
```
