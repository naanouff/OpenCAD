/**
 * OpenCAD Kernel — public surface.
 * K3-3: extrude plate golden via occt-kernel. O2 extracts the editor pipeline.
 */

export const KERNEL_NAME = 'OpenCAD Kernel'
export const KERNEL_BOOTSTRAP = 'occt-kernel'
export const EXPRESSION_DIALECT_V0 = 'opencad.expr.v0'

export { chargerKernel, runBatch } from './chargerKernel.ts'
export { rebuildExtrudePlate, type ExtrudePlateIntent, type ExtrudePlateResult } from './extrudePlate.ts'
export { rebuildRevolveCylinder, type RevolveCylinderIntent, type RevolveResult } from './revolveSolid.ts'
export {
  rebuildPlateWithHole,
  type PlateWithHoleIntent,
  type PlateWithHoleResult,
} from './plateWithHole.ts'
export {
  resoudreEsquisse,
  etatEsquisse,
  exigerContraint,
  type EsquisseKernel,
  type EsquisseResolue,
  type StatutContrainte,
} from './sketchSolve.ts'
export { rebuildExtrudeFromRectangle } from './extrudeFromSketch.ts'
export { evaluer } from './evaluateur.ts'
export {
  listerTopo,
  listerTopoPlaque,
  idFace,
  idEdge,
  idBody,
  type TopoSnapshot,
  type TopoResult,
} from './topoIds.ts'
export { ecrireCadomesh, lireCadomesh, type CadomeshWriteOptions } from './writeCadomesh.ts'

export type KernelIntent = {
  /** cadompart `expression_dialect`, if any */
  expressionDialect?: string
  /** Parameter name → expression or literal string */
  parameters?: Record<string, string>
}

export type KernelRebuildResult =
  | { ok: true; status: 'stub' }
  | { ok: false; code: string; error: string }

/** Validates intent contract; solid rebuild is not implemented in K3-2. */
export function rebuild(intent: KernelIntent): KernelRebuildResult {
  const dialect = intent.expressionDialect?.trim()
  if (dialect && dialect !== EXPRESSION_DIALECT_V0) {
    return {
      ok: false,
      code: 'UnsupportedDialect',
      error: `unsupported expression_dialect: ${dialect}`,
    }
  }
  if (dialect === EXPRESSION_DIALECT_V0) {
    for (const [name, expression] of Object.entries(intent.parameters ?? {})) {
      if (!name.trim()) {
        return { ok: false, code: 'InvalidParameter', error: 'empty parameter name' }
      }
      if (expression.trim() === '') {
        return {
          ok: false,
          code: 'InvalidParameter',
          error: `empty expression for ${name}`,
        }
      }
    }
  }
  return { ok: true, status: 'stub' }
}

export function identity() {
  return {
    name: KERNEL_NAME,
    bootstrap: KERNEL_BOOTSTRAP,
    dialect: EXPRESSION_DIALECT_V0,
  }
}
