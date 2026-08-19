'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/invoice-meta'

const fmtXof = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

interface InvoiceRecord {
  id: string
  invoice_number: string
  total: number
  status: string
  issue_date: string | null
  due_date: string | null
  paid_at: string | null
  client?: { name: string; email: string } | null
}

type PageStatus = 'loading' | 'success' | 'empty' | 'error'

const SkeletonRow = () => (
  <tr style={{ height: 56, borderBottom: '1px solid #E5E7EB' }}>
    <td style={{ padding: '8px 0' }} />
  </tr>
)

const SkeletonTable = ({ count }: { count: number }) => (
  <table>
    <tbody>
      {Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />)}
    </tbody>
  </table>
)

const EmptyState = ({ message, cta }: { message: string; cta?: React.ReactNode }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ margin: '0 auto 8px', color: '#64748B' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="15" x2="15" y2="9" />
    </svg>
    <h3 style={{ margin: '8px 0', color: '#64748B' }}>{message}</h3>
    {cta && <div>{cta}</div>}
  </div>
)

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div style={{ border: '1px solid #FECACA', borderRadius: 12, padding: 24, background: '#FEE2E2', textAlign: 'center', margin: '24px 0' }}>
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ margin: '0 auto 8px', color: '#DC2626' }}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <p style={{ margin: '8px 0', color: '#991B1B' }}>{message}</p>
    <button onClick={onRetry} style={{ marginTop: 16, padding: '8px 16px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
      Réessayer
    </button>
  </div>
)
export default function InvoicesPage() {
  const [status, setStatus] = useState<PageStatus>('loading')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filterStatus = 'all'
  const filterMonth = 'all'

  useEffect(() => {
    async function loadInvoices() {
      setStatus('loading')
      setError(null)

      try {
        const res = await fetch('/api/invoices')

        if (!res.ok) {
          throw new Error('Erreur serveur')
        }

        const data = await res.json()

        if (!data || data.length === 0) {
          setStatus('empty')
        } else {
          setInvoices(data as InvoiceRecord[])
          setStatus('success')
        }
      } catch (err) {
        console.error('Erreur chargement factures:', err)
        setStatus('error')
        setError(
          'Impossible de charger les factures. Vérifiez votre connexion ou réessayez plus tard.'
        )
      }
    }

    void loadInvoices()
  }, [])

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = !search ||
        inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus
      const matchMonth =
        filterMonth === 'all' || (inv.issue_date && inv.issue_date.startsWith(filterMonth))
      return matchSearch && matchStatus && matchMonth
    })
  }, [invoices, search, filterStatus, filterMonth])

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0)
    const pending = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length
    const overdue = invoices.filter((i) => i.status === 'overdue').length
    return { paid, pending, overdue, total: invoices.length }
  }, [invoices])

  switch (status) {
    case 'loading':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px' }}>Factures</h1>
          <SkeletonTable count={10} />
          <p style={{ fontSize: 14, color: '#64748B' }}>Chargement des factures...</p>
        </div>
      )

    case 'empty':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px' }}>Factures</h1>
          <EmptyState
            message="Aucune facture pour l'instant"
            cta={<button
              style={{
                marginTop: 16,
                padding: '8px 16px',
                background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setStatus('loading')}
            >
              + Créer ma première facture
            </button>}
          />
        </div>
      )

    case 'error':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px' }}>Factures</h1>
          <ErrorState
            message={error || 'Une erreur inattendue est survenue'}
            onRetry={() => setStatus('loading')}
          />
        </div>
      )

    case 'success':
    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px' }}>Factures</h1>

          {/* Header avec stats et search */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>Factures</h2>
              <p style={{ fontSize: 14, color: '#64748B' }}>{stats.total} facture{stats.total > 1 ? 's' : ''}</p>
            </div>
            <div style={{ flexShrink: 1 }}>
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 40,
                  width: 300,
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#0F172A',
                  background: '#F8FAFC',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>

          {/* Table des factures */}
          <div style={{ marginTop: 24, overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>N° Facture</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Client</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Montant</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Statut</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Échéance</th>
                  <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>
                      {inv.invoice_number}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B' }}>
                      {inv.client?.name || '—'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      {fmtXof(Number(inv.total || 0))}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: INVOICE_STATUS_COLORS[inv.status as keyof typeof INVOICE_STATUS_COLORS]?.bg || '#F1F5F9',
                          color: INVOICE_STATUS_COLORS[inv.status as keyof typeof INVOICE_STATUS_COLORS]?.color || '#475569',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS] || inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748B' }}>{fmtDate(inv.due_date)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          href={`/dashboard/invoices/${inv.id}`}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            background: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            textDecoration: 'none',
                            color: '#64748B',
                            transition: 'all 0.15s',
                          }}
                          title="Voir"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: 14, height: 14 }}
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer cette facture ?')) {
                              void (async () => {
                                try {
                                  const res = await fetch(`/api/invoices/${inv.id}`, { method: 'DELETE' })
                                  if (!res.ok) {
                                    throw new Error('Erreur API')
                                  }
                                  setInvoices((prev) => prev.filter((i) => i.id !== inv.id))
                                } catch (err) {
                                  console.error('Erreur suppression facture:', err)
                                  setError('La facture n\u2019a pas pu être supprimée.')
                                }
                              })()
                            }
                          }}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            background: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            color: '#64748B',
                            transition: 'all 0.15s',
                          }}
                          title="Supprimer"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: 14, height: 14 }}
                          >
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer avec actions */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
            <Link
              href="/dashboard/invoices/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 38,
                padding: '0 16px',
                background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                color: '#fff',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              + Créer une facture
            </Link>
          </div>
        </div>
      )
  }
}