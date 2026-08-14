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