import { createClient } from '@/lib/supabase/server'
import { ProfilePatchInput } from './profile.validator'

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(userId: string, input: ProfilePatchInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, user_id: userId, ...input, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  if (error) throw error
}

/**
 * Suppression du compte via la RPC serveur sécurisée (SECURITY DEFINER +
 * auth.uid() check). La RPC refuse tout user_id différent de la session.
 * Retourne `true` si la suppression a eu lieu, `false` si refusée.
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('delete_user_account', { user_id: userId })
  if (error) throw error
  return data === true
}