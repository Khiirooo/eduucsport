// Supabase browser client - singleton pattern for client-side usage only
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  )
  
  return client
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  client = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('educ-sport-data')
  }
}
