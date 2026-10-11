/** Datums d’origine (extrait éditeur `datums.ts`) — repère Y-up. */
export type Vecteur3 = readonly [number, number, number]

/** Chevauchement peau pour fuse du tube latéral (mm OCCT). */
export const CHEVAUCHE_TUBE = 0.3

export type DatumPlan = {
  id: string
  normale: Vecteur3
  axeU: Vecteur3
  axeV: Vecteur3
}

const DATUMS: Record<string, DatumPlan> = {
  'plan.dessus': {
    id: 'plan.dessus',
    normale: [0, 1, 0],
    axeU: [1, 0, 0],
    axeV: [0, 0, -1],
  },
  'plan.12h': {
    id: 'plan.12h',
    normale: [0, 0, 1],
    axeU: [1, 0, 0],
    axeV: [0, 1, 0],
  },
  'plan.3h': {
    id: 'plan.3h',
    normale: [1, 0, 0],
    axeU: [0, 1, 0],
    axeV: [0, 0, 1],
  },
}

export function datumParId(id: string): DatumPlan | undefined {
  return DATUMS[id]
}

function uvVersMonde(
  datum: DatumPlan,
  u: number,
  v: number,
  altitude: number,
): Vecteur3 {
  const { normale, axeU, axeV } = datum
  return [
    normale[0] * altitude + axeU[0] * u + axeV[0] * v,
    normale[1] * altitude + axeU[1] * u + axeV[1] * v,
    normale[2] * altitude + axeU[2] * u + axeV[2] * v,
  ]
}

/**
 * GCS → monde pour wires OCCT.
 * Sur plan.dessus le solveur porte v vers +Z, le datum d’affichage a V = −Z.
 */
export function gcsVersMonde(
  datum: DatumPlan,
  u: number,
  v: number,
  altitude = 0,
): Vecteur3 {
  const versZPlus = Math.abs(datum.normale[1]) > 0.9
  return uvVersMonde(datum, u, versZPlus ? -v : v, altitude)
}

/** Direction d’extrusion le long de la normale du datum. */
export function directionDatum(
  support: string,
  profondeur: number,
): readonly [number, number, number] {
  const datum = datumParId(support)
  if (!datum) return [0, profondeur, 0]
  const n = datum.normale
  return [n[0] * profondeur || 0, n[1] * profondeur || 0, n[2] * profondeur || 0]
}
