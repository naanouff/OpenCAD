/** Arithmetic + parameter names — dialect `opencad.expr.v0`. */
export function evaluer(expression: string, parametres: Map<string, string>): number {
  const noms = [...parametres.keys()].sort((a, b) => b.length - a.length)
  let formule = expression.trim()
  for (const nom of noms) {
    formule = formule.replaceAll(nom, parametres.get(nom) ?? '')
  }
  if (!/^[\d+\-*/().\s]+$/.test(formule)) {
    throw new Error(`expression inconnue: ${expression}`)
  }
  const valeur = Function(`"use strict"; return (${formule})`)() as number
  if (typeof valeur !== 'number' || Number.isNaN(valeur)) {
    throw new Error(`expression invalide: ${expression}`)
  }
  return valeur
}
