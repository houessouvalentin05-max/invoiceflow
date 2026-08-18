'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

const fmtXof = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

interface ReportSummary {
  totalInvoices: number
  totalCollected: number
  pendingCount: number
  overdueCount: number
}

export default function ReportsPage() {
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#fff'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const accent = '#2563EB'

  const [summary, setSummary] = useState<ReportSummary>({ totalInvoices: 0, totalCollected: 0, pendingCount: 0, overdueCount: 0 })
  const [status, setStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setStatus('loading')
        const res = await fetch('/api/invoices')
        if (!res.ok) throw new Error(`Réponse API invalide (invoices: ${res.status})`)

        const invoices: { status: string; total: number }[] = await res.json()
        const items = invoices || []
        if (cancelled) return
        const nextSummary: ReportSummary = {
          totalInvoices: items.length,
          totalCollected: items.filter(i => i.status === 'paid').reduce((sum, item) => sum + Number(item.total || 0), 0),
          pendingCount: items.filter(i => i.status === 'pending').length,
          overdueCount: items.filter(i => i.status === 'overdue').length,
        }
        setSummary(nextSummary)
        setStatus(items.length === 0 ? 'empty' : 'success')
      } catch (err) {
        if (cancelled) return
        console.error('Erreur de chargement des rapports :', err)
        setStatus('error')
      }
    }

    void load()
    return () => { cancelled = true }
  }, [retryKey])

  const reports = [
    { title: 'Résumé mensuel', description: 'Vue globale de vos revenus, factures en attente et paiements reçus.', stat: fmtXof(summary.totalCollected) },
    { title: 'Clients à relancer', description: 'Identifie les factures encore ouvertes ou en retard.', stat: `${summary.overdueCount} en retard` },
    { title: 'Performance de collecte', description: 'Suivi simple de votre taux de paiement et des dossiers actifs.', stat: `${summary.pendingCount} en attente` },
  ]

  const header = (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Rapports</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 6px' }}>Centralisez vos prévisions et vos suivis</h1>
      <p style={{ fontSize: 14, color: muted, margin: 0 }}>Générez des vues utiles pour piloter votre activité et préparer vos échanges commerciaux.</p>
    </div>
  )

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ width: 110, height: 10, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9', marginBottom: 16 }} />
              <div style={{ width: 140, height: 24, borderRadius: 6, background: isDark ? '#1F2937' : '#F1F5F9' }} />
              <div style={{ width: 140, height: 10, borderRadius: 4, background: isDark ? '#1F2937' : '#F1F5F9', marginTop: 12 }} />
            </div>
          ))}
        </div>
        <div style={{ height: 160, background: surface, border: `1px solid ${border}`, borderRadius: 16 }} />
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {header}
        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6M9 16h4M7 3h10l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 6px' }}>Aucun rapport pour le moment</h3>
          <p style={{ fontSize: 13, color: muted, margin: '0 0 20px' }}>Créez vos premières factures pour générer des rapports.</p>
          <Link href="/dashboard/invoices/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            + Créer une facture
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {header}
        <div style={{ border: '1px solid #FECACA', borderRadius: 12, padding: 28, background: isDark ? '#450A0A' : '#FEF2F2', textAlign: 'center' }}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ margin: '0 auto 10px', color: '#DC2626' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#FCA5A5' : '#991B1B', margin: '0 0 6px' }}>Impossible de charger les rapports</h3>
          <p style={{ fontSize: 13, color: isDark ? '#FECACA' : '#B91C1C', margin: '0 0 20px' }}>Vérifiez votre connexion internet puis réessayez.</p>
          <button onClick={() => setRetryKey(k => k + 1)} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {header}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {reports.map((item) => (
          <div key={item.title} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
            <div style={{ fontSize: 11.5, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: text, letterSpacing: '-0.4px', marginBottom: 8 }}>{item.stat}</div>
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>{item.description}</p>
          </div>
        ))}
      </div>

      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 10px' }}>Actions rapides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ height: 40, padding: '0 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Exporter en PDF</button>
          <button style={{ height: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${border}`, background: surface, color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Envoyer par email</button>
          <button style={{ height: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${border}`, background: surface, color: muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Créer un rapport hebdo</button>
        </div>
      </div>
    </div>
  )
}
