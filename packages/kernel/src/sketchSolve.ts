import { evaluer } from './evaluateur.ts'
import { geometriePlan } from './geometriePlanCorne.ts'

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
  /** Cible nommée (`cercle.exterieur`, `anneau`, …) — centres déjà à l’origine en v1. */
  concentrique?: string
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

/** Segment profil révolution (rayon/hauteur) ou corne (ecart/debord/largeur). */
export type SegmentEsquisse = {
  id: string
  rayon?: string
  hauteur?: string
  ecart?: string
  debord?: string
  largeur?: string
}

export type ArcEsquisse = {
  id: string
  rayon?: string
  concentrique?: string
}

export type SymetrieAxe = 'vertical' | 'horizontal'

export type EsquisseKernel = {
  rectangles?: RectangleEsquisse[]
  cercles?: CercleEsquisse[]
  polygones?: PolygoneEsquisse[]
  segments?: SegmentEsquisse[]
  arcs?: ArcEsquisse[]
  symetries?: SymetrieAxe[]
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

const SEGMENTS_ARC = 24

function densifierArcCourt(
  cx: number,
  cy: number,
  rayon: number,
  angle0: number,
  angle1: number,
): { u: number; v: number }[] {
  let delta = angle1 - angle0
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  const n = Math.max(4, Math.ceil((Math.abs(delta) / (Math.PI * 2)) * SEGMENTS_ARC * 8))
  const pts: { u: number; v: number }[] = []
  for (let i = 0; i <= n; i++) {
    const a = angle0 + (delta * i) / n
    pts.push({ u: cx + Math.cos(a) * rayon, v: cy + Math.sin(a) * rayon })
  }
  return pts
}

function contourCorne(
  ecart: number,
  debord: number,
  largeurBout: number,
  largeurRacine: number,
  rayonRacine: number,
  rayonPeau: number,
): { u: number; v: number }[] {
  const a0 = ecart / 2
  const u1 = rayonPeau + debord
  const geo = geometriePlan({
    a0,
    u1,
    plan: { largeurBout, largeurRacine, rayonRacine },
    rayonPeau,
  })
  const uInterieur = Math.sqrt(Math.max(0, rayonPeau * rayonPeau - a0 * a0))
  const angleA = Math.atan2(uInterieur, a0)
  const anglePeauOrigine = Math.atan2(geo.peau[1], geo.peau[0])
  const fillet = densifierArcCourt(geo.C[0], geo.C[1], geo.Rr, geo.anglePeau, geo.angleQt)
  const skin = densifierArcCourt(0, 0, rayonPeau, angleA, anglePeauOrigine)
  return [
    { u: geo.peau[0], v: geo.peau[1] },
    ...fillet.slice(1),
    { u: geo.Ptip[0], v: geo.Ptip[1] },
    { u: a0, v: u1 },
    { u: a0, v: uInterieur },
    ...skin.slice(1, -1),
  ]
}

function appliquerSymetries(
  base: { u: number; v: number }[],
  symetries: SymetrieAxe[],
): { u: number; v: number }[][] {
  const vertical = symetries.includes('vertical')
  const horizontal = symetries.includes('horizontal')
  const copies: { u: number; v: number }[][] = [base]
  if (vertical) copies.push(base.map((p) => ({ u: -p.u, v: p.v })))
  if (horizontal) copies.push(base.map((p) => ({ u: p.u, v: -p.v })))
  if (vertical && horizontal) copies.push(base.map((p) => ({ u: -p.u, v: -p.v })))
  return copies
}

/** Contour corne Oyster + copies par symétrie (extrait éditeur `resoudreCorne`). */
function resoudreCorne(esquisse: EsquisseKernel, parametres: Map<string, string>): EsquisseResolue | null {
  const segments = esquisse.segments ?? []
  const arcs = esquisse.arcs ?? []
  if (segments.length < 3 || arcs.length < 1) return null
  const ecartExpr = segments.find((e) => e.ecart)?.ecart
  const debordExpr = segments.find((e) => e.debord)?.debord
  const largeurs = segments.filter((e) => e.largeur).map((e) => e.largeur!)
  const rayonExpr = arcs.find((e) => e.rayon)?.rayon
  if (!ecartExpr || !debordExpr || largeurs.length < 2 || !rayonExpr) return null
  if (!parametres.has('diametre_boite')) {
    return {
      points: [],
      polylines: [],
      degres: 1,
      ferme: true,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }
  const ecart = evaluer(ecartExpr, parametres)
  const debord = evaluer(debordExpr, parametres)
  const largeurBout = evaluer(largeurs[0]!, parametres)
  const largeurRacine = evaluer(largeurs[1]!, parametres)
  const rayonRacine = evaluer(rayonExpr, parametres)
  const rayonPeau = evaluer('diametre_boite', parametres) / 2
  const base = contourCorne(ecart, debord, largeurBout, largeurRacine, rayonRacine, rayonPeau)
  const regions = appliquerSymetries(base, esquisse.symetries ?? [])
  const points: PointResolu[] = []
  const polylines: { points: string[] }[] = []
  regions.forEach((region, r) => {
    const ids: string[] = []
    region.forEach((p, i) => {
      const id = `corne.${r}.${i}`
      points.push({ id, u: p.u, v: p.v })
      ids.push(id)
    })
    if (ids[0]) ids.push(ids[0])
    polylines.push({ points: ids })
  })
  return {
    points,
    polylines,
    degres: 0,
    ferme: true,
    statut: 'contraint',
    contraintes: [],
  }
}

/**
 * Required sketch solve (K3-5 + O2-6/7/13/14):
 * rectangle ; cercle (+ concentrique v1) ; polygone ; corne + symétrie.
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
  const segments = esquisse.segments ?? []
  const arcs = esquisse.arcs ?? []

  const corne = resoudreCorne(esquisse, parametres)
  if (corne) return corne

  if (
    rectangles.length === 0 &&
    cercles.length === 0 &&
    polygones.length === 0 &&
    segments.length === 0 &&
    arcs.length === 0
  ) {
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

  if (cercles.length >= 1 && rectangles.length === 0 && polygones.length === 0 && segments.length === 0) {
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
