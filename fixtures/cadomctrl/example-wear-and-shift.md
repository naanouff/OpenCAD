# Example — wear and setup shift `.cadomctrl`

*Informative logical document (not binary Protobuf).* Assigns the two parameters declared in [`../cadomfab/example-face-and-contour.md`](../cadomfab/example-face-and-contour.md). Values replace the nominals; the gamme file stays unchanged.

```yaml
version_major: 0
version_minor: 0
name: "plate-face-after-inspect"
fab_asset_id: "asset-plate-fab"
adjustments:
  - parameter_id: "wear-em10"
    value: -0.04
    measured_deviation: -0.04
  - parameter_id: "shift-z"
    value: 0.02
    measured_deviation: 0.02
```
