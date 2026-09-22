import { SUPABASE_URL, authHeaders } from './supabaseClient'

export async function buscarPacientePorIdentificacion(numeroIdentificacion) {
  const url = `${SUPABASE_URL}/rest/v1/paciente?select=*&num_id=eq.${encodeURIComponent(numeroIdentificacion)}`
  const response = await fetch(url, { headers: authHeaders() })

  if (!response.ok) {
    throw new Error(`Error consultando paciente (status ${response.status})`)
  }

  const data = await response.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function crearPaciente(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/paciente`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Error creando paciente (status ${response.status})`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data[0] : data
}
