/** Support de sketch issu d’une face de solide (extrait éditeur `registreFaces`). */
export type FaceSupport = {
  id: string
  origin: readonly [number, number, number]
  normal: readonly [number, number, number]
}

export type RegistreFaces = Map<string, FaceSupport>

/** Faces dessus/dessous après features le long de Y (mm OCCT). */
export function faceDepuisBornesY(yMin: number, yMax: number): RegistreFaces {
  const faces: RegistreFaces = new Map()
  faces.set('face.dessus', {
    id: 'face.dessus',
    origin: [0, yMax, 0],
    normal: [0, 1, 0],
  })
  faces.set('face.dessous', {
    id: 'face.dessous',
    origin: [0, yMin, 0],
    normal: [0, -1, 0],
  })
  return faces
}

export function yPlanFace(face: FaceSupport): number {
  return face.origin[1]
}

/** Plan du wire outil : fond de poche (origine − normal × profondeur). */
export function yPlanCoupe(face: FaceSupport, profondeur: number): number {
  return face.origin[1] - face.normal[1] * profondeur
}

/** Extrusion outil depuis le fond vers l’extérieur (+ marge). */
export function directionCoupe(
  face: FaceSupport,
  profondeur: number,
  marge = 0.4,
): readonly [number, number, number] {
  const d = profondeur + marge
  return [face.normal[0] * d || 0, face.normal[1] * d || 0, face.normal[2] * d || 0]
}

export function directionExtrude(
  face: FaceSupport,
  profondeur: number,
): readonly [number, number, number] {
  return [
    face.normal[0] * profondeur || 0,
    face.normal[1] * profondeur || 0,
    face.normal[2] * profondeur || 0,
  ]
}
