import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api-error'
import { listNotifications } from '@/features/notifications/api/notification.service'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const result = await listNotifications(user.id)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}