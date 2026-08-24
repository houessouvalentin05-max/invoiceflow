import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api-error'
import { markNotificationRead } from '@/features/notifications/api/notification.service'

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id } = await params
    await markNotificationRead(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}