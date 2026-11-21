import type { KernelBatchOp } from './types.ts'

/** Flat XYZ polyline (mm), closed if first≈last. */
export type Polyline3 = number[]

export type DirectionExtrusion = readonly [number, number, number]

type Point3 = [number, number, number]

/** Cercle exact derrière une polyligne densifiée : `radial` va du centre au premier sommet (longueur = rayon). */
export type CercleExact = { centre: Point3; radial: Point3 }

const cerclesExacts = new WeakMap<Polyline3, CercleExact>()

/** Retient que `poly` densifie un cercle, pour que `opsProfil` le balaie en vraie surface. */
export function marquerCercle(poly: Polyline3, cercle: CercleExact): Polyline3 {
  cerclesExacts.set(poly, cercle)
  return poly
}

export function cercleDe(poly: Polyline3): CercleExact | undefined {
  return cerclesExacts.get(poly)
}

const milieuxArcs = new WeakMap<Polyline3, number[]>()

/**
 * Retient que certains sommets de `poly` sont des milieux d’arc : `genres[i] === 1` fait passer
 * un arc vrai par le sommet i, entre ses deux voisins.
 */
export function marquerArcs(poly: Polyline3, genres: number[]): Polyline3 {
  if (genres.length !== poly.length / 3) throw new Error('un genre par sommet')
  if (genres.some((g) => g === 1)) milieuxArcs.set(poly, genres)
  return poly
}

export function arcsDe(poly: Polyline3): number[] | undefined {
  return milieuxArcs.get(poly)
}

function opFil(polyline: Polyline3, as: string): KernelBatchOp {
  const genres = milieuxArcs.get(polyline)
  return genres
    ? { op: 'make_wire_arcs', args: [polyline, genres], as }
    : { op: 'make_wire_polyline', args: [polyline], as }
}

/** Translation d’une polyligne ; le cercle exact et les arcs suivent. */
export function decalerPolyline(poly: Polyline3, dx: number, dy: number, dz: number): Polyline3 {
  const out: number[] = []
  for (let i = 0; i < poly.length; i += 3) out.push(poly[i]! + dx, poly[i + 1]! + dy, poly[i + 2]! + dz)
  const cercle = cerclesExacts.get(poly)
  if (cercle) {
    const [cx, cy, cz] = cercle.centre
    cerclesExacts.set(out, { centre: [cx + dx, cy + dy, cz + dz], radial: cercle.radial })
  }
  const genres = milieuxArcs.get(poly)
  if (genres) milieuxArcs.set(out, genres)
  return out
}

/**
 * Profil d’esquisse balayé selon `direction`. Un cercle est tourné autour de son axe plutôt qu’extrudé :
 * le noyau n’a ni cercle ni placement de cylindre, et un polygone extrudé donne une face par pan.
 */
export function opsProfil(
  polyline: Polyline3,
  direction: DirectionExtrusion,
  uid: string,
): { ops: KernelBatchOp[]; as: string } {
  const cercle = cerclesExacts.get(polyline)
  const longueur = Math.hypot(direction[0], direction[1], direction[2])
  if (!cercle || longueur === 0) return opsExtrude(polyline, direction, uid)
  const [cx, cy, cz] = cercle.centre
  const [rx, ry, rz] = cercle.radial
  const [dx, dy, dz] = direction
  const rectangle = [
    cx, cy, cz,
    cx + rx, cy + ry, cz + rz,
    cx + rx + dx, cy + ry + dy, cz + rz + dz,
    cx + dx, cy + dy, cz + dz,
    cx, cy, cz,
  ]
  const w = `w${uid}`
  const f = `f${uid}`
  const s = `s${uid}`
  return {
    ops: [
      { op: 'make_wire_polyline', args: [rectangle], as: w },
      { op: 'make_face_from_wire', args: [{ handle: w }], as: f },
      {
        op: 'revolve',
        args: [{ handle: f }, cx, cy, cz, dx / longueur, dy / longueur, dz / longueur, Math.PI * 2],
        as: s,
      },
    ],
    as: s,
  }
}

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
      opFil(polyline, w),
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
      opFil(polyline, w),
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

/** Congé sur arêtes (indices locaux, ou `null` = toutes). Extrait éditeur. */
export function opsFillet(
  solidAs: string,
  rayon: number,
  indices: number[] | null,
  uid: string,
): { ops: KernelBatchOp[]; solidAs: string } {
  const as = `fillet${uid}`
  return {
    ops: [{ op: 'fillet_edges', args: [{ handle: solidAs }, rayon, indices], as }],
    solidAs: as,
  }
}

/** Chanfrein sur arêtes (indices locaux, ou `null` = toutes). */
export function opsChanfrein(
  solidAs: string,
  distance: number,
  indices: number[] | null,
  uid: string,
): { ops: KernelBatchOp[]; solidAs: string } {
  const as = `chamfer${uid}`
  return {
    ops: [{ op: 'chamfer_edges', args: [{ handle: solidAs }, distance, indices], as }],
    solidAs: as,
  }
}
