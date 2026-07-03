import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getAuthenticatedClient() {
  const supabase = createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!session) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error('Aucune session active pour accéder aux données.')
    }
  }

  return supabase
}