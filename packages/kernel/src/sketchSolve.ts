import { evaluer } from './evaluateur.ts'

export type StatutContrainte = 'sous-contraint' | 'contraint' | 'surcontraint'

export type Contrainte =
  | { sorte: 'distance'; a: string; b: string; valeur: number }
  | { sorte: 'horizontal'; a: string; b: string }
  | { sorte: 'vertical'; a: string; b: string }

export type PointResolu = { id: string; u: number; v: number }

export type RectangleEsquisse = {
  id: string
  /** Length along U (metres or mm — host units; same as longueur editor). */
  longueur?: string
  /** Width along V. */
  largeur?: string
}

export type EsquisseKernel = {
  rectangles: RectangleEsquisse[]
}

export type EsquisseResolue = {
  points: PointResolu[]
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

/** Required sketch solve (K3-5): rectangle H/V + distance. */
export function resoudreEsquisse(
  esquisse: EsquisseKernel,
  parametres: Map<string, string> = new Map(),
  options: OptionsResoudre = {},
): EsquisseResolue {
  const extra = options.contraintesExtra ?? []
  const rectangles = esquisse.rectangles
  if (rectangles.length === 0) {
    return {
      points: [],
      polylines: [],
      degres: 0,
      ferme: false,
      statut: 'sous-contraint',
      contraintes: [],
    }
  }
  if (rectangles.length === 1) {
    return resoudreRectangle(rectangles[0]!, parametres, extra)
  }
  const parties = rectangles.map((r) => resoudreRectangle(r, parametres, []))
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
