import { SUPABASE_URL, authHeaders } from './supabaseClient'

export async function obtenerTestXPaciente() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/testxpaciente?select=*`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`No se pudo obtener la información (status ${response.status})`)
  }

  return response.json()
}
