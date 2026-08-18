'use client'

import { useEffect, useState, useMemo } from 'react'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

const fmtXof = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const METHOD_LABELS: Record<string, string> = {
  momo: 'MTN MoMo',
  orange_money: 'Orange Money',
  bank_transfer: 'Virement bancaire',
  cash: 'Espèces',
  other: 'Autre',
}

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  momo:          { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
  orange_money:  { bg: 'rgba(249,115,22,0.12)', color: '#EA580C' },
  bank_transfer: { bg: 'rgba(37,99,235,0.1)',   color: '#2563EB' },
  cash:          { bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
  other:         { bg: 'rgba(100,116,139,0.1)', color: '#475569' },
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  momo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="8" cy="14.5" r="1.5"/>
    </svg>
  ),
  orange_money: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="8" cy="14.5" r="1.5"/>
    </svg>
  ),
  bank_transfer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21V12h6v9"/>
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <circle cx="12" cy="12" r="9"/>
    </svg>
  ),
}

const inputStyle = (isDark: boolean, border: string, text: string, surfaceSoft: string): React.CSSProperties => ({
  width: '100%', height: 42, border: `1px solid ${border}`, borderRadius: 10,
  padding: '0 14px', fontSize: 14, color: text, background: surfaceSoft,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
})
const labelStyle = (muted: string): React.CSSProperties => ({
  display: 'block', fontSize: 13, fontWeight: 600, color: muted, marginBottom: 6
})

interface PaymentRecord {
  id: string
  amount: number
  method: string
  reference: string | null
  paid_at: string | null
  invoice?: { invoice_number?: string; client?: { name?: string } | null } | null
}
interface InvoiceRecord {
  id: string
  invoice_number: string
  total: number
  status: string
  client?: { name?: string } | null
}

export default function PaymentsPage() {
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#fff'
  const surfaceSoft = isDark ? '#1F2937' : '#F8FAFC'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'

  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ invoice_id: '', amount: '', method: 'momo', reference: '', paid_at: new Date().toISOString().split('T')[0] })

  async function fetchData() {
    try {
      setLoadError(false)
      const [payRes, invRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/invoices'),
      ])

      if (!payRes.ok || !invRes.ok) throw new Error('Réponse API invalide')

      const pay: PaymentRecord[] = await payRes.json()
      const inv: InvoiceRecord[] = await invRes.json()
      setPayments(pay || [])
      setInvoices(inv || [])
    } catch (err) {
      console.error('Erreur de chargement des paiements :', err)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadData() {
      await fetchData()
      active = false
    }

    void loadData()

    return () => { active = false }
  }, [retryKey])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.invoice_id || !form.amount) { setError('Facture et montant requis.'); return }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: form.invoice_id,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference || undefined,
        paid_at: form.paid_at,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Erreur lors de l’enregistrement du paiement.')
      setSaving(false)
      return
    }

    setForm({ invoice_id: '', amount: '', method: 'momo', reference: '', paid_at: new Date().toISOString().split('T')[0] })
    setShowForm(false)
    setSaving(false)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce paiement ?')) return

    const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Erreur lors de la suppression du paiement.')
      return
    }
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + Number(p.amount), 0)
    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
      return acc
    }, {} as Record<string, number>)
    return { total, byMethod, count: payments.length }
  }, [payments])

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 4px' }}>Paiements</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Suivez tous les paiements reçus pour vos factures.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          height: 40, padding: '0 18px', borderRadius: 10,
          background: showForm ? surface : 'linear-gradient(135deg,#2563EB,#7C3AED)',
          color: showForm ? text : '#fff', fontSize: 13, fontWeight: 600,
          border: showForm ? `1px solid ${border}` : 'none', cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: showForm ? 'none' : '0 4px 14px -4px rgba(79,70,229,0.5)'
        }}>
          {showForm ? '✕ Fermer' : '+ Enregistrer un paiement'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 22, boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)' }}>
          <div style={{ fontSize: 11.5, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Total encaissé</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: text, letterSpacing: '-0.7px' }}>{loading ? '...' : fmtXof(stats.total)}</div>
        </div>
        {(['momo', 'orange_money', 'bank_transfer'] as const).map(m => (
          <div key={m} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 22, boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ color: METHOD_COLORS[m].color }}>{METHOD_ICONS[m]}</div>
              <span style={{ fontSize: 11.5, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{METHOD_LABELS[m]}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: text, letterSpacing: '-0.5px' }}>{loading ? '...' : fmtXof(stats.byMethod[m] || 0)}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 20px' }}>Enregistrer un paiement</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle(muted)}>Facture <span style={{ color: '#DC2626' }}>*</span></label>
                <select value={form.invoice_id} onChange={e => setForm({ ...form, invoice_id: e.target.value })} required style={{ ...inputStyle(isDark, border, text, surfaceSoft), cursor: 'pointer' }}>
                  <option value="">Sélectionner une facture</option>
                  {unpaidInvoices.map(i => (
                    <option key={i.id} value={i.id}>{i.invoice_number} — {i.client?.name || '—'} ({fmtXof(Number(i.total))})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle(muted)}>Montant reçu <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" required style={inputStyle(isDark, border, text, surfaceSoft)} />
              </div>
              <div>
                <label style={labelStyle(muted)}>Méthode de paiement</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={{ ...inputStyle(isDark, border, text, surfaceSoft), cursor: 'pointer' }}>
                  {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle(muted)}>Date du paiement</label>
                <input type="date" value={form.paid_at} onChange={e => setForm({ ...form, paid_at: e.target.value })} style={inputStyle(isDark, border, text, surfaceSoft)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle(muted)}>Référence <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>optionnel</span></label>
                <input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="N° de transaction MoMo, référence bancaire..." style={inputStyle(isDark, border, text, surfaceSoft)} />
              </div>
            </div>
            {error && <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                height: 40, padding: '0 20px', borderRadius: 10,
                background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, fontFamily: 'inherit'
              }}>
                {saving ? 'Enregistrement...' : 'Enregistrer le paiement'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                height: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${border}`,
                background: surface, color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)' }}>
        {loadError ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={1.8} style={{ margin: '0 auto 12px' }}>
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 6px' }}>Impossible de charger les paiements</h3>
            <p style={{ fontSize: 13, color: muted, margin: '0 0 20px' }}>Vérifiez votre connexion internet puis réessayez.</p>
            <button onClick={() => { setLoading(true); setRetryKey(k => k + 1) }} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ width: 70, height: 10, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />)}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, padding: '16px 8px', borderTop: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` }}>
                <div style={{ width: 90, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />
                <div style={{ width: 120, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />
                <div style={{ width: 70, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />
                <div style={{ width: 100, height: 12, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9' }} />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 6px' }}>Aucun paiement enregistré</h3>
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>Enregistrez votre premier paiement reçu.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Facture', 'Client', 'Montant', 'Méthode', 'Référence', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', borderBottom: `1px solid ${border}`, background: surfaceSoft }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p: PaymentRecord) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = surfaceSoft}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: text, fontFamily: 'monospace' }}>{p.invoice?.invoice_number || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: muted }}>{p.invoice?.client?.name || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#059669' }}>+{fmtXof(Number(p.amount))}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: METHOD_COLORS[p.method]?.bg, color: METHOD_COLORS[p.method]?.color }}>
                      {METHOD_ICONS[p.method]}
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{p.reference || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: muted }}>{fmtDate(p.paid_at)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}