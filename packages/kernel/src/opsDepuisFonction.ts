import type { KernelBatchOp } from './types.ts'

/** Flat XYZ polyline (mm), closed if first≈last. */
export type Polyline3 = number[]

export type DirectionExtrusion = readonly [number, number, number]

/** Wire → face → extrude (extrait éditeur `opsDepuisFonction`). */
export function opsExtrude(
  polyline: Polyline3,
  direction: DirectionExtrusion,
  uid: string,
): { ops: KernelBatchOp[]; as: string } {
  const w = `w${uid}`
  const f = `f${uid}`
  const s = `s${uid}`
  return {
    ops: [
      { op: 'make_wire_polyline', args: [polyline], as: w },
      { op: 'make_face_from_wire', args: [{ handle: w }], as: f },
      { op: 'extrude', args: [{ handle: f }, direction[0], direction[1], direction[2]], as: s },
    ],
    as: s,
  }
}

/** Profil → face → révolution autour de Y. */
export function opsRevolution(polyline: Polyline3, uid: string): { ops: KernelBatchOp[]; as: string } {
  const w = `w${uid}`
  const f = `f${uid}`
  const s = `s${uid}`
  return {
    ops: [
      { op: 'make_wire_polyline', args: [polyline], as: w },
      { op: 'make_face_from_wire', args: [{ handle: w }], as: f },
      { op: 'revolve', args: [{ handle: f }, 0, 0, 0, 0, 1, 0, Math.PI * 2], as: s },
    ],
    as: s,
  }
}

/** Première feature → alias courant ; suivantes → fuse (extrait éditeur). */
export function accrocherSolide(
  solidAs: string | null,
  outilAs: string,
  uid: string,
): { ops: KernelBatchOp[]; solidAs: string } {
  if (!solidAs) return { ops: [], solidAs: outilAs }
  const as = `fuse${uid}`
  return {
    ops: [{ op: 'boolean_fuse', args: [{ handle: solidAs }, { handle: outilAs }], as }],
    solidAs: as,
  }
}

/** Boolean cut (extrait éditeur). */
export function opsCouper(
  solidAs: string,
  outilAs: string,
  uid: string,
): { ops: KernelBatchOp[]; solidAs: string } {
  const as = `cut${uid}`
  return {
    ops: [{ op: 'boolean_cut', args: [{ handle: solidAs }, { handle: outilAs }], as }],
    solidAs: as,
  }
}
