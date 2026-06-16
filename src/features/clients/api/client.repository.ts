import { createClient } from '@/lib/supabase/server'
import { ClientInput } from './client.validator'

export async function getClients(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createClientDb(userId: string, input: ClientInput) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id: string, userId: string, input: ClientInput) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(id: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}