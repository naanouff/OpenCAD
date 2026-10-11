export const KERNEL_NAME = 'OpenCAD Kernel'
export const KERNEL_BOOTSTRAP = 'occt-kernel'
export const EXPRESSION_DIALECT_V0 = 'opencad.expr.v0'
export const KERNEL_PRODUCT_VERSION = '0.0.0'

export function identity() {
  return {
    name: KERNEL_NAME,
    bootstrap: KERNEL_BOOTSTRAP,
    dialect: EXPRESSION_DIALECT_V0,
    version: KERNEL_PRODUCT_VERSION,
  }
}
