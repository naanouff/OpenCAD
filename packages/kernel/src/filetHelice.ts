import type { KernelBatchOp } from './types.ts'
import { opsRevolution, type Polyline3 } from './opsDepuisFonction.ts'

/** Cotes d'un filet métrique simplifié (mm, degrés). */
export type CotesFilet = {
  /** Rayon de crête (Ø nominal / 2). */
  rayonCrete: number
  /** Rayon de l'âme, fond du filet. */
  rayonAme: number
  pas: number
  /** Angle inclus du triangle de filet. */
  angleFilet: number
  /** Angle inclus du cône de pointe. */
  anglePointe: number
}

/** Le triangle plonge dans l'âme pour que la fusion ne touche pas une surface tangente. */
const RECOUVREMENT = 0.1
/** L'enveloppe dépasse la crête : la crête reste vive hors de la pointe. */
const JEU_CRETE = 0.05
const DECALAGE_ENVELOPPE = 0.1

type Station = { r: number; y: number }

function stations(profil: Polyline3): Station[] {
  const liste: Station[] = []
  for (let i = 0; i < profil.length; i += 3) liste.push({ r: profil[i]!, y: profil[i + 1]! })
  const premier = liste[0]
  const dernier = liste.at(-1)
  if (liste.length > 1 && premier && dernier && premier.r === dernier.r && premier.y === dernier.y) {
    liste.pop()
  }
  return liste
}

/** Dernière hauteur encore au rayon du fût, avant que le profil s'ouvre en tête. */
function epaule(profil: Station[], rayon: number) {
  let y = profil[0]!.y
  for (let i = 1; i < profil.length; i++) {
    if (profil[i]!.r > rayon + 1e-4 && profil[i - 1]!.r <= rayon + 1e-4) return profil[i - 1]!.y
    if (profil[i]!.r <= rayon + 1e-4) y = profil[i]!.y
  }
  return y
}

/**
 * Corps fileté autour de Y : l'âme `profil` (révolution), plus un triangle vif balayé
 * le long d'une hélice à droite. Le filet est rogné par une enveloppe : le cône de pointe,
 * qui l'amincit puis l'éteint, et le plan de l'épaulement sous la tête.
 */
export function opsFilet(
  profil: Polyline3,
  cotes: CotesFilet,
  uid: () => string,
): { ops: KernelBatchOp[]; as: string } {
  const { rayonCrete, rayonAme, pas, angleFilet, anglePointe } = cotes
  if (!(pas > 0) || !(rayonCrete > rayonAme) || !(rayonAme > 0)) {
    throw new Error('filet : pas ou rayons invalides')
  }
  const points = stations(profil)
  const y0 = Math.min(...points.map((p) => p.y))
  const yBut = epaule(points, rayonCrete)
  if (!(yBut - y0 > pas)) throw new Error('filet : corps plus court que le pas')

  const ame = opsRevolution(profil, uid())

  const rFond = rayonAme - RECOUVREMENT * (rayonCrete - rayonAme)
  const demi = (rayonCrete - rFond) * Math.tan(((angleFilet / 2) * Math.PI) / 180)
  if (!(demi < pas / 2)) throw new Error('filet : flancs plus larges que le pas')
  const yDepart = y0 - pas
  const triangle = [rFond, yDepart - demi, 0, rayonCrete, yDepart, 0, rFond, yDepart + demi, 0, rFond, yDepart - demi, 0]

  // Aucune face de l'enveloppe ne doit se confondre avec l'âme ou la tête : son cône
  // passe sous celui de la pointe, son plateau s'arrête juste sous l'épaulement. Un filet
  // qui entre dans la tête fait échouer sa fusion.
  const rEnveloppe = rayonCrete + JEU_CRETE
  const penteCone = Math.tan(((anglePointe / 2) * Math.PI) / 180)
  const yBas = y0 + DECALAGE_ENVELOPPE
  const yHaut = yBut - DECALAGE_ENVELOPPE
  const yCone = yBas + rEnveloppe / penteCone
  const enveloppe =
    yCone < yHaut
      ? [0, yBas, 0, rEnveloppe, yCone, 0, rEnveloppe, yHaut, 0, 0, yHaut, 0, 0, yBas, 0]
      : [0, yBas, 0, (yHaut - yBas) * penteCone, yHaut, 0, 0, yHaut, 0, 0, yBas, 0]

  const id = uid()
  const fil = `filFilet${id}`
  const helice = `helice${id}`
  const env = opsRevolution(enveloppe, uid())
  const rogne = `filet${id}`
  const corps = `corpsFilete${id}`
  return {
    ops: [
      ...ame.ops,
      { op: 'make_wire_polyline', args: [triangle], as: fil },
      {
        op: 'sweep_helix',
        args: [{ handle: fil }, 0, yDepart, 0, 0, 1, 0, 1, 0, 0, rFond, pas, yHaut - yDepart + pas],
        as: helice,
      },
      ...env.ops,
      { op: 'boolean_common', args: [{ handle: helice }, { handle: env.as }], as: rogne },
      { op: 'boolean_fuse', args: [{ handle: ame.as }, { handle: rogne }], as: corps },
    ],
    as: corps,
  }
}
