'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getAuthenticatedClient } from '@/lib/supabase/client'

const fmtXof = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_LABELS: Record<string, string> = {
  paid: 'Payée', pending: 'En attente', overdue: 'En retard', draft: 'Brouillon',
}
const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  paid:    { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10B981' },
  pending: { bg: 'rgba(245,158,11,0.12)', color: '#D97706', dot: '#F59E0B' },
  overdue: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', dot: '#EF4444' },
  draft:   { bg: 'rgba(100,116,139,0.1)', color: '#475569', dot: '#94A3B8' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

  useEffect(() => {
    let active = true

    async function loadInvoices() {
      try {
        setLoading(true)
        setError(null)
        const supabase = await getAuthenticatedClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          if (!active) return
          setInvoices([])
          setError('Vous devez être connecté pour voir vos factures.')
          return
        }

        const { data, error } = await supabase.from('invoices')
          .select('id,invoice_number,total,status,issue_date,due_date,paid_at,client:clients(name,email)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!active) return

        if (error) {
          console.error('Supabase error:', error)
          setLoading(false)
          return
        }

        setInvoices(data || [])
      } catch (err) {
        if (!active) return
        console.error('Erreur chargement factures:', err)
        setInvoices([])
        setError('Impossible de charger les factures. Vérifiez votre session Supabase.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInvoices()

    return () => {
      active = false
    }
  }, [])

  async function updateStatus(id: string, status: string) {
    try {
      const supabase = await getAuthenticatedClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Aucune session active pour mettre à jour la facture.')
      }

      await supabase.from('invoices').update({ status }).eq('id', id).eq('user_id', user.id)
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
    } catch (err) {
      console.error('Erreur mise à jour statut facture:', err)
      setError('Le statut n’a pas pu être mis à jour. Vérifiez votre session.')
    }
  }

  const months = useMemo(() => {
    const seen = new Set<string>()
    invoices.forEach(inv => {
      if (inv.issue_date) {
        const d = new Date(inv.issue_date)
        seen.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      }
    })
    return Array.from(seen).sort().reverse()
  }, [invoices])

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !search ||
        inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus
      const matchMonth = filterMonth === 'all' || (inv.issue_date && inv.issue_date.startsWith(filterMonth))
      return matchSearch && matchStatus && matchMonth
    })
  }, [invoices, search, filterStatus, filterMonth])

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0)
    const pending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length
    const overdue = invoices.filter(i => i.status === 'overdue').length
    return { paid, pending, overdue, total: invoices.length }
  }, [invoices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px', margin: '0 0 4px' }}>Factures</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Créez, envoyez et suivez vos factures.</p>
        </div>
        <Link href="/dashboard/invoices/new" style={{
          height: 40, padding: '0 18px', borderRadius: 10,
          background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff',
          fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
          textDecoration: 'none', boxShadow: '0 4px 14px -4px rgba(79,70,229,0.5)',
          transition: 'all 0.2s'
        }}>
          + Nouvelle facture
        </Link>
      </div>

      {/* Stats chips */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total factures', value: String(stats.total), color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
          { label: 'Revenus encaissés', value: fmtXof(stats.paid), color: '#059669', bg: 'rgba(16,185,129,0.08)' },
          { label: 'En attente', value: String(stats.pending), color: '#D97706', bg: 'rgba(245,158,11,0.08)' },
          { label: 'En retard', value: String(stats.overdue), color: '#DC2626', bg: 'rgba(239,68,68,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{loading ? '...' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 }}>
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par N° ou client..."
            style={{ width: '100%', height: 38, border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px 0 34px', fontSize: 13, color: '#0F172A', background: '#F8FAFC', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 38, border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FAFC', fontSize: 13, color: '#334155', padding: '0 12px', fontFamily: 'inherit', outline: 'none' }}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ height: 38, border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FAFC', fontSize: 13, color: '#334155', padding: '0 12px', fontFamily: 'inherit', outline: 'none' }}>
          <option value="all">Tous les mois</option>
          {months.map(m => {
            const [y, mo] = m.split('-')
            const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            return <option key={m} value={m}>{label}</option>
          })}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/>
                <path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Aucune facture trouvée</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>Créez votre première facture pour commencer.</p>
            <Link href="/dashboard/invoices/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              + Créer une facture
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['N° Facture', 'Client', 'Montant', 'Statut', 'Échéance', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv: any) => {
                  const sc = STATUS_COLORS[inv.status] || STATUS_COLORS.draft
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                        <Link href={`/dashboard/invoices/${inv.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{inv.invoice_number}</Link>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{inv.client?.name || '—'}</div>
                        {inv.client?.email && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{inv.client.email}</div>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{fmtXof(Number(inv.total))}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={inv.status}
                          onChange={e => { e.stopPropagation(); void updateStatus(inv.id, e.target.value) }}
                          style={{ appearance: 'none', background: sc.bg, color: sc.color, border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: inv.status === 'overdue' ? '#DC2626' : '#64748B', fontWeight: inv.status === 'overdue' ? 600 : 400 }}>{fmtDate(inv.due_date)}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B' }}>{fmtDate(inv.issue_date)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Link href={`/dashboard/invoices/${inv.id}`} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'grid', placeItems: 'center', textDecoration: 'none', color: '#64748B', transition: 'all 0.15s' }}
                            title="Voir">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cette facture ?')) {
                                void (async () => {
                                  try {
                                    const supabase = await getAuthenticatedClient()
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) {
                                      throw new Error('Aucune session active pour supprimer la facture.')
                                    }

                                    await supabase.from('invoices').delete().eq('id', inv.id).eq('user_id', user.id)
                                    setInvoices(prev => prev.filter(i => i.id !== inv.id))
                                  } catch (err) {
                                    console.error('Erreur suppression facture:', err)
                                    setError('La facture n’a pas pu être supprimée. Vérifiez votre session.')
                                  }
                                })()
                              }
                            }}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#64748B', transition: 'all 0.15s' }}
                            title="Supprimer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}