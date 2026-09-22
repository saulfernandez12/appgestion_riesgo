import { SUPABASE_URL, authHeaders } from './supabaseClient'

export async function guardarTestMaestro({ idPaciente, puntos }) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/test_maestro`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ id_paciente: idPaciente, puntos }),
  })

  if (!response.ok) {
    throw new Error(`No se pudo guardar el test (status ${response.status})`)
  }

  const data = await response.json()
  const registro = Array.isArray(data) ? data[0] : data

  if (!registro) {
    throw new Error('El servidor no devolvió el registro creado.')
  }

  return registro
}
