export function calculateAge(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - year
  const noCumpleaniosAun = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (noCumpleaniosAun) age -= 1
  return age
}

export function esMenorDeEdad(isoDate) {
  return calculateAge(isoDate) < 18
}

export function esMayorOIgualA60(isoDate) {
  return calculateAge(isoDate) >= 60
}

export function requiereAcompanante(isoDate) {
  return esMenorDeEdad(isoDate) || esMayorOIgualA60(isoDate)
}
