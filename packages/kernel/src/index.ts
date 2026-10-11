/**
 * OpenCAD Kernel — public surface.
 * Required badge path: K3-3…K3-5 + K3-7; Complete export: K3-8.
 */

export {
  KERNEL_NAME,
  KERNEL_BOOTSTRAP,
  EXPRESSION_DIALECT_V0,
  KERNEL_PRODUCT_VERSION,
  identity,
} from './identity.ts'

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
  type CercleEsquisse,
  type PolygoneEsquisse,
  type RectangleEsquisse,
  type StatutContrainte,
} from './sketchSolve.ts'
export { rebuildExtrudeFromRectangle } from './extrudeFromSketch.ts'
export {
  opsExtrude,
  opsRevolution,
  opsCouper,
  opsFillet,
  accrocherSolide,
  type Polyline3,
  type DirectionExtrusion,
} from './opsDepuisFonction.ts'
export { polylinesDepuisResolue } from './polylinesDepuisResolue.ts'
export {
  compilerHistorique,
  type OperationKernel,
  type CompilationKernel,
  type OptionsCompilation,
} from './compilerHistorique.ts'
export {
  faceDepuisBornesY,
  yPlanFace,
  yPlanCoupe,
  directionCoupe,
  directionExtrude,
  type FaceSupport,
  type RegistreFaces,
} from './registreFaces.ts'
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
export {
  ecrireCadombrep,
  ecrireCadombrepPlaque,
  lireCadombrep,
  importerBrep,
  type CadombrepWriteOptions,
} from './writeCadombrep.ts'

import { EXPRESSION_DIALECT_V0 } from './identity.ts'

export type KernelIntent = {
  expressionDialect?: string
  parameters?: Record<string, string>
}

export type KernelRebuildResult =
  | { ok: true; status: 'stub' }
  | { ok: false; code: string; error: string }

/** Validates intent contract; solid rebuild uses typed rebuild* helpers. */
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
