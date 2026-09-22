export const SUPABASE_URL = 'https://hijutdmtpzohqmyupwyi.supabase.co'

export function authHeaders() {
  return {
    apikey: import.meta.env.VITE_API_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
  }
}
