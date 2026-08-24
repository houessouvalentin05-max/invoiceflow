'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardTheme } from '@/app/dashboard/theme-context'
import { useIsMobile } from '@/lib/use-viewport'
import { useNotifications } from '@/features/notifications/notifications-context'
import type { AppNotification, NotificationType } from '@/features/notifications/types'

const TYPE_COLORS: Record<NotificationType, string> = {
  payment_received: '#10B981',
  invoice_paid: '#10B981',
  invoice_overdue: '#EF4444',
  payment_reminder: '#F59E0B',
  system: '#64748B',
}

function typeLabel(n: AppNotification): string {
  switch (n.type) {
    case 'payment_received':
      return `Paiement reçu${n.reference.invoiceNumber ? ` · ${n.reference.invoiceNumber}` : ''}`
    case 'invoice_paid':
      return 'Facture payée'
    case 'invoice_overdue':
      return 'Facture en retard'
    case 'payment_reminder':
      return 'Rappel de paiement'
    default:
      return 'Notification'
  }
}

function typeDetail(n: AppNotification, amount: string): string {
  switch (n.type) {
    case 'payment_received':
      return amount ? `Montant : ${amount}` : 'Un paiement a été enregistré.'
    case 'invoice_paid':
      return amount ? `Facture réglée · ${amount}` : 'La facture a été réglée.'
    case 'invoice_overdue':
      return 'Cette facture est en retard de paiement.'
    case 'payment_reminder':
      return 'Un rappel de paiement est programmé.'
    default:
      return ''
  }
}

type IconProps = { type: NotificationType; color: string }

function TypeIcon({ type, color }: IconProps) {
  if (type === 'payment_received' || type === 'invoice_paid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color }}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  }
  if (type === 'invoice_overdue') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    )
  }
  if (type === 'payment_reminder') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color }}>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  )
}

function formatAmount(amount?: number): string {
  if (amount == null) return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount)
}

function formatAbsoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function NotificationBell() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { theme } = useDashboardTheme()
  const { notifications, unreadCount, status, error, markRead, refresh } = useNotifications()
  const [open, setOpen] = useState(false)

  const isDark = theme === 'dark'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#111827'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const panelBg = isDark ? '#0F172A' : '#fff'
  const panelBorder = isDark ? '#1E293B' : '#E2E8F0'

  function handleItemClick(n: AppNotification) {
    void markRead(n.id)
    setOpen(false)
    if (n.reference.invoiceId) {
      router.push(`/dashboard/invoices/${n.reference.invoiceId}`)
    }
  }

  const bellIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  )

  let badge: React.ReactNode = null
  if (status === 'loading') {
    badge = <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: muted, opacity: 0.6 }} />
  } else if (status === 'success' && unreadCount > 0) {
    badge = (
      <span style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', lineHeight: 1, border: `2px solid ${isDark ? '#020617' : '#fff'}` }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )
  }

  let dropdown: React.ReactNode = null
  if (status === 'loading') {
    dropdown = (
      <div style={{ padding: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 10px' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: isDark ? '#1E293B' : '#F1F5F9', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 10, width: '70%', borderRadius: 5, background: isDark ? '#1E293B' : '#F1F5F9' }} />
              <div style={{ height: 10, width: '45%', borderRadius: 5, background: isDark ? '#1E293B' : '#F1F5F9' }} />
            </div>
          </div>
        ))}
      </div>
    )
  } else if (status === 'error') {
    dropdown = (
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: muted }}>
          {error ?? 'Impossible de charger les notifications.'}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Réessayer
        </button>
      </div>
    )
  } else if (notifications.length === 0) {
    dropdown = (
      <div style={{ padding: '28px 16px', textAlign: 'center' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '50%', background: isDark ? '#1E293B' : '#F1F5F9', color: muted, margin: '0 auto 10px' }}>
          {bellIcon}
        </span>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: text }}>Aucune notification pour l’instant</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: muted }}>Les paiements reçus et relances apparaîtront ici.</p>
      </div>
    )
  } else {
    dropdown = (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: text }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#EF4444', borderRadius: 999, padding: '2px 8px' }}>
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {notifications.map((n) => {
          const color = TYPE_COLORS[n.type] ?? muted
          const amount = formatAmount(n.reference.amount)
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => handleItemClick(n)}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                background: n.read ? 'transparent' : (isDark ? 'rgba(37,99,235,0.09)' : '#EFF6FF'),
                cursor: 'pointer',
                border: 'none',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}`,
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color, flexShrink: 0 }}>
                <TypeIcon type={n.type} color={color} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: text }}>{typeLabel(n)}</span>
                <span style={{ display: 'block', fontSize: 12, color: muted, marginTop: 2 }}>{typeDetail(n, amount)}</span>
                <span style={{ display: 'block', fontSize: 11, color: muted, marginTop: 4, opacity: 0.8 }}>
                  {formatAbsoluteDate(n.created_at)}
                </span>
              </span>
              {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 5 }} />}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: isDark ? '#0F172A' : '#fff', color: text, display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative' }}
      >
        {bellIcon}
        {badge}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} aria-hidden="true" />
          <div style={{ position: 'absolute', top: 44, right: 0, width: isMobile ? 'calc(100vw - 40px)' : 340, maxWidth: 'calc(100vw - 40px)', maxHeight: 420, overflowY: 'auto', background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: 14, boxShadow: '0 20px 45px -20px rgba(2,6,23,0.45)', zIndex: 50, color: text }}>
            {dropdown}
          </div>
        </>
      )}
    </div>
  )
}