'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: invoices } = await supabase.from('invoices').select('status,total').eq('user_id', user.id)
      const items = invoices || []
      setSummary({
        totalInvoices: items.length,
        totalCollected: items.filter(i => i.status === 'paid').reduce((sum, item) => sum + Number(item.total || 0), 0),
        pendingCount: items.filter(i => i.status === 'pending').length,
        overdueCount: items.filter(i => i.status === 'overdue').length,
      })
    }

    void load()
  }, [])

  const reports = [
    { title: 'Résumé mensuel', description: 'Vue globale de vos revenus, factures en attente et paiements reçus.', stat: fmtXof(summary.totalCollected) },
    { title: 'Clients à relancer', description: 'Identifie les factures encore ouvertes ou en retard.', stat: `${summary.overdueCount} en retard` },
    { title: 'Performance de collecte', description: 'Suivi simple de votre taux de paiement et des dossiers actifs.', stat: `${summary.pendingCount} en attente` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Rapports</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 6px' }}>Centralisez vos prévisions et vos suivis</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Générez des vues utiles pour piloter votre activité et préparer vos échanges commerciaux.</p>
      </div>

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
