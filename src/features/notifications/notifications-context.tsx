'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getAuthenticatedClient } from '@/lib/supabase/client'
import { AppNotification } from './types'

export type NotificationsStatus = 'loading' | 'success' | 'empty' | 'error'

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  status: NotificationsStatus
  error: string | null
  markRead: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [status, setStatus] = useState<NotificationsStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = (await res.json()) as { notifications?: AppNotification[]; unreadCount?: number }
      const items = payload.notifications ?? []
      setNotifications(items)
      setUnreadCount(Number(payload.unreadCount) || 0)
      setStatus(items.length === 0 ? 'empty' : 'success')
      setError(null)
    } catch (err) {
      console.error('[notifications] fetch', err)
      setStatus('error')
      setError('Impossible de charger les notifications.')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let cleanupChannel: (() => void) | null = null

    void (async () => {
      try {
        await refresh()
      } catch {
        // refresh gère son propre status d'erreur
      }
      if (!mounted) return

      try {
        const supabase = await getAuthenticatedClient()
        const channel = supabase
          .channel('notifications-realtime')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload) => {
              if (!mounted) return
              const row = (payload as { new?: Record<string, unknown> }).new as unknown as AppNotification | undefined
              if (!row || typeof row.id !== 'string') return
              setNotifications((prev) => [row!, ...prev.filter((n) => n.id !== row!.id)].slice(0, 50))
              if (!row.read) setUnreadCount((prev) => prev + 1)
            }
          )
          .subscribe()
        cleanupChannel = () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.error('[notifications] realtime', err)
      }
    })()

    return () => {
      mounted = false
      cleanupChannel?.()
    }
  }, [refresh])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    try {
      const res = await fetch(`/api/notifications/${id}/mark-read`, { method: 'PATCH' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.error('[notifications] mark-read', err)
      await refresh()
    }
  }, [refresh])

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, status, error, markRead, refresh }),
    [notifications, unreadCount, status, error, markRead, refresh]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within a NotificationsProvider')
  return context
}