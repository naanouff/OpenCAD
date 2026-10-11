/** Géométrie du profil en plan Oyster (extrait éditeur `corne.geometriePlan`). */

export type PlanCorne = {
  largeurBout: number
  largeurRacine: number
  rayonRacine: number
}

/**
 * Profil dans le quart (a ≥ 0, u ≥ 0) :
 * flanc du coin de bout au point de peau à `largeurRacine`, congé creux tangent.
 */
export function geometriePlan(opts: {
  a0: number
  u1: number
  plan: PlanCorne
  rayonPeau: number
}) {
  const { a0, u1, plan, rayonPeau } = opts
  const aBout = a0 + plan.largeurBout
  const aRacine = a0 + plan.largeurRacine
  const uPeauRacine = Math.sqrt(Math.max(0, rayonPeau * rayonPeau - aRacine * aRacine))
  const Ptip: [number, number] = [aBout, u1]
  const V: [number, number] = [aRacine - aBout, uPeauRacine - u1]
  const longueur = Math.hypot(V[0], V[1])
  const Vh: [number, number] = [V[0] / longueur, V[1] / longueur]
  const N: [number, number] = [-Vh[1], Vh[0]]
  const Rr = plan.rayonRacine
  const R = rayonPeau + Rr
  const Ox = Ptip[0] + Rr * N[0]
  const Oy = Ptip[1] + Rr * N[1]
  const B = 2 * (Ox * Vh[0] + Oy * Vh[1])
  const C0 = Ox * Ox + Oy * Oy - R * R
  const disc = Math.max(0, B * B - 4 * C0)
  const racines = [(-B - Math.sqrt(disc)) / 2, (-B + Math.sqrt(disc)) / 2]
  const tChoisi =
    racines.find((valeur) => valeur > 0 && valeur < longueur) ??
    Math.min(...racines.filter((valeur) => valeur > 0))
  const C: [number, number] = [Ox + tChoisi * Vh[0], Oy + tChoisi * Vh[1]]
  const Qt: [number, number] = [Ptip[0] + tChoisi * Vh[0], Ptip[1] + tChoisi * Vh[1]]
  const peau: [number, number] = [(C[0] * rayonPeau) / R, (C[1] * rayonPeau) / R]
  const angleQt = Math.atan2(Qt[1] - C[1], Qt[0] - C[0])
  const anglePeau = Math.atan2(peau[1] - C[1], peau[0] - C[0])
  return { aBout, aRacine, Ptip, N, Vh, C, Qt, peau, angleQt, anglePeau, Rr, rayonPeau }
}
