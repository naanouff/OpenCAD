import { evaluer } from './evaluateur.ts'

export type StatutContrainte = 'sous-contraint' | 'contraint' | 'surcontraint'

export type Contrainte =
  | { sorte: 'distance'; a: string; b: string; valeur: number }
  | { sorte: 'horizontal'; a: string; b: string }
  | { sorte: 'vertical'; a: string; b: string }
  | { sorte: 'rayon'; centre: string; point: string; valeur: number }

export type PointResolu = { id: string; u: number; v: number }

export type RectangleEsquisse = {
  id: string
  /** Length along U (metres or mm — host units; same as longueur editor). */
  longueur?: string
  /** Width along V. */
  largeur?: string
}

/** Cercle coté par diamètre (extrait éditeur `solveurGcs.resoudreCercle`). */
export type CercleEsquisse = {
  id: string
  diametre?: string
}

/**
 * Polygone régulier à pans plats ; `entreplat` = distance entre pans opposés.
 * Extrait éditeur `resoudrePolygoneRegulier`.
 */
export type PolygoneEsquisse = {
  id: string
  pans: number
  entreplat?: string
}

export type EsquisseKernel = {
  rectangles?: RectangleEsquisse[]
  cercles?: CercleEsquisse[]
  polygones?: PolygoneEsquisse[]
}

export type EsquisseResolue = {
  points: PointResolu[]
  /** Rectangle: coin ids fermés. Cercle: un seul id bord (`.p`) — densifié en polylines. */
  polylines: { points: string[] }[]
  degres: number
  ferme: boolean
  statut: StatutContrainte
  contraintes: Contrainte[]
}

export type OptionsResoudre = {
  contraintesExtra?: Contrainte[]
}

function contraintesRectangle(
  entite: RectangleEsquisse,
  parametres: Map<string, string>,
): { contraintes: Contrainte[]; manques: number; longueur?: number; largeur?: number } {
  const a = `${entite.id}.a`
  const b = `${entite.id}.b`
  const c = `${entite.id}.c`
  const d = `${entite.id}.d`
  const contraintes: Contrainte[] = [
    { sorte: 'horizontal', a, b },
    { sorte: 'vertical', a: b, b: c },
    { sorte: 'horizontal', a: c, b: d },
    { sorte: 'vertical', a: d, b: a },
  ]
  let manques = 0
  let longueur: number | undefined
  let largeur: number | undefined
  if (entite.longueur) {
    longueur = evaluer(entite.longueur, parametres)
    contraintes.push({ sorte: 'distance', a, b, valeur: longueur })
  } else manques += 1
  if (entite.largeur) {
    largeur = evaluer(entite.largeur, parametres)
    contraintes.push({ sorte: 'distance', a, b: d, valeur: largeur })
  } else manques += 1
  return { contraintes, manques, longueur, largeur }
}

function resoudreRectangle(
  entite: RectangleEsquisse,
  parametres: Map<string, string>,
  extra: Contrainte[],
): EsquisseResolue {
  const { contraintes, manques, longueur, largeur } = contraintesRectangle(entite, parametres)
  const toutes = [...contraintes, ...extra]
  const a = `${entite.id}.a`
  const b = `${entite.id}.b`
  const c = `${entite.id}.c`
  const d = `${entite.id}.d`

  if (manques > 0 || longueur === undefined || largeur === undefined) {
    return {
      points: [],
      polylines: [],
      degres: manques,
      ferme: true,
      statut: 'sous-contraint',
      contraintes: toutes,
    }
  }

  const lu = longueur / 2
  const lv = largeur / 2
  const points: PointResolu[] = [
    { id: a, u: -lu, v: -lv },
    { id: b, u: lu, v: -lv },
    { id: c, u: lu, v: lv },
    { id: d, u: -lu, v: lv },
  ]

  for (const ctr of extra) {
    if (ctr.sorte !== 'distance') continue
    const pa = points.find((p) => p.id === ctr.a)
    const pb = points.find((p) => p.id === ctr.b)
    if (!pa || !pb) continue
    const dist = Math.hypot(pa.u - pb.u, pa.v - pb.v)
    if (Math.abs(dist - ctr.valeur) > 1e-6) {
      return {
        points,
        polylines: [{ points: [a, b, c, d, a] }],
        degres: 0,
        ferme: true,
        statut: 'surcontraint',
        contraintes: toutes,
      }
    }
  }

  return {
    points,
    polylines: [{ points: [a, b, c, d, a] }],
    degres: 0,
    ferme: true,
    statut: 'contraint',
    contraintes: toutes,
  }
}

function resoudreCercle(entite: CercleEsquisse, parametres: Map<string, string>): EsquisseResolue {
  if (!entite.diametre) {
    return {
      points: [],
      polylines: [],
      degres: 1,
      ferme: true,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }
  const r = evaluer(entite.diametre, parametres) / 2
  const centre = `${entite.id}.o`
  const bord = `${entite.id}.p`
  const contraintes: Contrainte[] = [{ sorte: 'rayon', centre, point: bord, valeur: r }]
  return {
    points: [
      { id: centre, u: 0, v: 0 },
      { id: bord, u: r, v: 0 },
    ],
    polylines: [{ points: [bord] }],
    degres: 0,
    ferme: true,
    statut: 'contraint',
    contraintes,
  }
}

function fusionner(parties: EsquisseResolue[]): EsquisseResolue {
  const degres = parties.reduce((s, p) => s + p.degres, 0)
  const sur = parties.some((p) => p.statut === 'surcontraint')
  return {
    points: parties.flatMap((p) => p.points),
    polylines: parties.flatMap((p) => p.polylines),
    degres,
    ferme: parties.every((p) => p.ferme),
    statut: sur ? 'surcontraint' : degres > 0 ? 'sous-contraint' : 'contraint',
    contraintes: parties.flatMap((p) => p.contraintes),
  }
}

function resoudrePolygoneRegulier(
  entite: PolygoneEsquisse,
  parametres: Map<string, string>,
): EsquisseResolue {
  const n = entite.pans
  if (!(n >= 3) || !Number.isFinite(n)) {
    return {
      points: [],
      polylines: [],
      degres: 1,
      ferme: true,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }
  if (!entite.entreplat) {
    return {
      points: [],
      polylines: [],
      degres: 1,
      ferme: true,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }
  const entreplat = evaluer(entite.entreplat, parametres)
  const rayon = entreplat / (2 * Math.cos(Math.PI / n))
  const points: PointResolu[] = []
  const ids: string[] = []
  for (let i = 0; i < n; i++) {
    const angle = Math.PI / n + (i * 2 * Math.PI) / n
    const id = `${entite.id}.${i}`
    points.push({ id, u: rayon * Math.cos(angle), v: rayon * Math.sin(angle) })
    ids.push(id)
  }
  if (ids[0]) ids.push(ids[0])
  return {
    points,
    polylines: [{ points: ids }],
    degres: 0,
    ferme: true,
    statut: 'contraint',
    contraintes: [],
  }
}

/**
 * Required sketch solve (K3-5 + O2-6/7):
 * rectangle ; cercle ; polygone régulier (entreplat).
 */
export function resoudreEsquisse(
  esquisse: EsquisseKernel,
  parametres: Map<string, string> = new Map(),
  options: OptionsResoudre = {},
): EsquisseResolue {
  const extra = options.contraintesExtra ?? []
  const rectangles = esquisse.rectangles ?? []
  const cercles = esquisse.cercles ?? []
  const polygones = esquisse.polygones ?? []

  if (rectangles.length === 0 && cercles.length === 0 && polygones.length === 0) {
    return {
      points: [],
      polylines: [],
      degres: 0,
      ferme: false,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }

  if (polygones.length === 1 && rectangles.length === 0 && cercles.length === 0) {
    return resoudrePolygoneRegulier(polygones[0]!, parametres)
  }

  if (polygones.length > 0 && rectangles.length === 0 && cercles.length === 0) {
    return fusionner(polygones.map((p) => resoudrePolygoneRegulier(p, parametres)))
  }

  if (cercles.length >= 1 && rectangles.length === 0 && polygones.length === 0) {
    return fusionner(cercles.map((c) => resoudreCercle(c, parametres)))
  }

  if (rectangles.length === 1 && cercles.length === 0 && polygones.length === 0) {
    return resoudreRectangle(rectangles[0]!, parametres, extra)
  }

  if (rectangles.length > 0 && cercles.length === 0 && polygones.length === 0) {
    return fusionner(rectangles.map((r) => resoudreRectangle(r, parametres, [])))
  }

  // Anneau / plaque+trous : rectangle(s) + cercle(s) (+ polygones) séparés.
  return fusionner([
    ...rectangles.map((r) => resoudreRectangle(r, parametres, [])),
    ...cercles.map((c) => resoudreCercle(c, parametres)),
    ...polygones.map((p) => resoudrePolygoneRegulier(p, parametres)),
  ])
}

export function etatEsquisse(
  esquisse: EsquisseKernel,
  parametres: Map<string, string> = new Map(),
): { ferme: boolean; degres: number; statut: StatutContrainte } {
  const out = resoudreEsquisse(esquisse, parametres)
  return { ferme: out.ferme, degres: out.degres, statut: out.statut }
}

/** Refuse rebuild when sketch is not fully constrained. */
export function exigerContraint(resolue: EsquisseResolue): void {
  if (resolue.statut === 'sous-contraint') {
    throw new Error('esquisse non contrainte')
  }
  if (resolue.statut === 'surcontraint') {
    throw new Error('esquisse surcontrainte')
  }
  if (!resolue.ferme || resolue.polylines.length === 0) {
    throw new Error('esquisse non contrainte')
  }
}
