import { createClient } from '@/lib/supabase/server'
import { AppNotification, NotificationType } from '../types'

export async function listNotifications(userId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('id,user_id,type,reference,read,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as AppNotification[]
}

export async function countUnreadNotifications(userId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
  return count ?? 0
}

export async function createNotificationDb(
  userId: string,
  input: { type: NotificationType; reference: Record<string, unknown> }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type: input.type, reference: input.reference })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markNotificationRead(id: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}