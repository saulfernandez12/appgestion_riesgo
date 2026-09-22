// Puntuación del Malnutrition Screening Tool (MST), según el formulario del
// PDF: "¿Ha perdido peso de manera involuntaria?" + (si aplica) "¿Cuánto?" +
// "¿Come mal por tener menos apetito?". Se suman todos los puntos marcados.

export const PESO_PERDIDA_OPTIONS = [
  { value: 'si', label: 'Sí', points: 2 },
  { value: 'no', label: 'No', points: 0 },
  { value: 'no_seguro', label: 'No estoy seguro', points: 2 },
]

export const CANTIDAD_OPTIONS = [
  { value: '1a5', label: 'De 1 a 5 kg', points: 1 },
  { value: '5a10', label: 'De 5 a 10 kg', points: 2 },
  { value: '11a15', label: 'De 11 a 15 kg', points: 3 },
  { value: 'mas15', label: 'Más de 15 kg', points: 4 },
  { value: 'no_se', label: 'No sé cuánto peso', points: 2 },
]

export const APETITO_OPTIONS = [
  { value: 'no', label: 'No', points: 0 },
  { value: 'si', label: 'Si', points: 1 },
]

function pointsFor(options, value) {
  return options.find((option) => option.value === value)?.points ?? 0
}

// La sección "En caso afirmativo" solo aplica (y solo suma) cuando la
// pregunta de pérdida de peso se respondió "Sí" o "No estoy seguro".
export function calculateMstScore({ pesoPerdida, cantidadPerdida, apetito }) {
  const pesoPerdidaPoints = pointsFor(PESO_PERDIDA_OPTIONS, pesoPerdida)
  const cantidadAplica = pesoPerdida === 'si' || pesoPerdida === 'no_seguro'
  const cantidadPoints = cantidadAplica ? pointsFor(CANTIDAD_OPTIONS, cantidadPerdida) : 0
  const apetitoPoints = pointsFor(APETITO_OPTIONS, apetito)
  return pesoPerdidaPoints + cantidadPoints + apetitoPoints
}

// tone: 'neutral' (< 2), 'warning' (2-3, naranja) o 'danger' (>= 4, rojo).
export function riskLevelFor(total) {
  if (total >= 4) return 'danger'
  if (total >= 2) return 'warning'
  return 'neutral'
}
