'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PDFDownloadButton } from '@/features/invoices/components/PDFDownloadButton'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Invoice {
  id: string
  invoice_number: string
  status: string
  currency: string
  subtotal: number
  tax: number
  total: number
  due_date: string | null
  created_at: string
  client: { name: string; email: string } | null
  items: InvoiceItem[]
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  overdue: 'En retard',
}

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'rgba(148, 163, 184, 0.16)', text: '#64748B' },
  sent: { bg: 'rgba(37, 99, 235, 0.14)', text: '#2563EB' },
  viewed: { bg: 'rgba(124, 58, 237, 0.14)', text: '#7C3AED' },
  paid: { bg: 'rgba(16, 185, 129, 0.16)', text: '#059669' },
  overdue: { bg: 'rgba(239, 68, 68, 0.14)', text: '#DC2626' },
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#ffffff'
  const surfaceSoft = isDark ? '#1F2937' : '#F8FAFC'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#111827'
  const muted = isDark ? '#94A3B8' : '#64748B'

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadInvoice() {
      try {
        setLoading(true)
        setError(false)
        const res = await fetch(`/api/invoices/${id}`)
        if (!res.ok) throw new Error(`Réponse API invalide (${res.status})`)
        const data = await res.json()
        if (cancelled) return
        setInvoice(data)
      } catch (err) {
        if (cancelled) return
        console.error('Erreur chargement facture:', err)
        setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInvoice()
    return () => { cancelled = true }
  }, [id, retryKey])

  async function handleStatusChange(nextStatus: string) {
    if (!invoice) return
    setSavingStatus(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const updated = await res.json()
      if (updated?.id) setInvoice({ ...invoice, status: updated.status })
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 28 }}>
          <div style={{ width: 120, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9', marginBottom: 16 }} />
          <div style={{ width: 280, height: 28, borderRadius: 6, background: isDark ? '#1F2937' : '#F1F5F9', marginBottom: 20 }} />
          <div style={{ width: 200, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9', marginBottom: 28 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div style={{ width: 100, height: 10, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9', marginBottom: 10 }} />
                <div style={{ width: 160, height: 14, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />
              </div>
            ))}
          </div>
          <div style={{ height: 160, borderRadius: 16, background: isDark ? '#1F2937' : '#F1F5F9' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ border: '1px solid #FECACA', borderRadius: 12, padding: 28, background: isDark ? '#450A0A' : '#FEF2F2', textAlign: 'center' }}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={1.8} style={{ margin: '0 auto 10px' }}>
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#FCA5A5' : '#991B1B', margin: '0 0 6px' }}>Impossible de charger la facture</h3>
          <p style={{ fontSize: 13, color: isDark ? '#FECACA' : '#B91C1C', margin: '0 0 20px' }}>Vérifiez votre connexion internet puis réessayez.</p>
          <button onClick={() => setRetryKey(k => k + 1)} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
          <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v4M15 4v4" />
        </svg>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: text, margin: '0 0 6px' }}>Facture introuvable</h3>
        <p style={{ fontSize: 14, color: muted, margin: '0 0 20px' }}>Cette facture n&apos;existe pas ou a été supprimée.</p>
        <button onClick={() => router.push('/dashboard/invoices')} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${border}`, background: surface, color: text, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Retour aux factures
        </button>
      </div>
    )
  }

  const pdfData = {
    id: invoice.id,
    clientName: invoice.client?.name || 'Client inconnu',
    date: new Date(invoice.created_at).toLocaleDateString('fr-FR'),
    dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—',
    currency: invoice.currency,
    items: (invoice.items || []).map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: muted, fontWeight: 600, padding: 0 }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: muted }}>
            <span>Statut</span>
            <select
              value={invoice.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={savingStatus}
              style={{ border: `1px solid ${border}`, background: surfaceSoft, color: text, borderRadius: 8, padding: '8px 10px', fontFamily: 'inherit' }}
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="viewed">Vue</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </label>
          <PDFDownloadButton invoice={pdfData} />
        </div>
      </div>

      <div style={{ border: `1px solid ${border}`, background: surface, borderRadius: 24, padding: 24, boxShadow: isDark ? '0 14px 34px -20px rgba(2, 6, 23, 0.65)' : '0 14px 34px -20px rgba(15, 23, 42, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${border}`, paddingBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px' }}>Facture</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0, letterSpacing: '-0.6px' }}>Facture #{invoice.invoice_number}</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: muted }}>Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <span style={{ padding: '8px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: statusColors[invoice.status]?.bg || 'rgba(148,163,184,0.16)', color: statusColors[invoice.status]?.text || muted }}>
            {statusLabels[invoice.status]}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 20 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: text }}>Client</h2>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: text }}>{invoice.client?.name || '—'}</p>
            <p style={{ margin: 0, fontSize: 14, color: muted }}>{invoice.client?.email || '—'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: text }}>Échéance</h2>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: text }}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—'}</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 16, border: `1px solid ${border}`, marginTop: 20 }}>
          <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <thead style={{ background: surfaceSoft }}>
              <tr style={{ textAlign: 'left', fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px' }}>Description</th>
                <th style={{ padding: '12px 14px' }}>Qté</th>
                <th style={{ padding: '12px 14px' }}>Prix unitaire</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map(item => (
                <tr key={item.id} style={{ borderTop: `1px solid ${border}` }}>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: text }}>{item.description}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: muted }}>{item.quantity}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, color: muted }}>{item.unit_price.toLocaleString()} {invoice.currency}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: text }}>{item.total.toLocaleString()} {invoice.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ maxWidth: 320, marginLeft: 'auto', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>Sous-total : <span style={{ fontWeight: 700, color: text }}>{invoice.subtotal.toLocaleString()} {invoice.currency}</span></p>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>TVA ({invoice.subtotal > 0 ? Math.round((invoice.tax / invoice.subtotal) * 100) : 0}%) : <span style={{ fontWeight: 700, color: text }}>{invoice.tax.toLocaleString()} {invoice.currency}</span></p>
          <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: text }}>Total : {invoice.total.toLocaleString()} {invoice.currency}</p>
        </div>
      </div>
    </div>
  )
}
