const STORAGE_KEY = 'mst-tests'

export function saveMstResult(patient, resultado, admin) {
  const record = {
    id: crypto.randomUUID(),
    guardadoEn: new Date().toISOString(),
    paciente: patient,
    resultado,
    admin,
  }
  const existentes = getMstResults()
  existentes.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes))
  return record
}

export function getMstResults() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
}
