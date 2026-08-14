'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

const fmtXof = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

interface InvoiceRecord {
  id: string
  total: number
  status: string
  issue_date: string | null
  due_date: string | null
  paid_at: string | null
  currency: string
}

interface ClientRecord {
  id: string
  name: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string | number }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111827', borderRadius: 10, padding: '10px 14px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtXof(payload[0]?.value ?? 0)}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#fff'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [resInv, resCli] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients'),
      ])

      if (!resInv.ok || !resCli.ok) {
        setLoading(false)
        return
      }

      const inv: InvoiceRecord[] = await resInv.json()
      const cli: ClientRecord[] = await resCli.json()
      setInvoices(inv || [])
      setClients(cli || [])
      setLoading(false)
    }

    void load()
  }, [])

  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  const totalCollected = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
  const avgInvoice = invoices.length ? invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0) / invoices.length : 0
  const collectionRate = invoices.length ? Math.round((paidInvoices.length / invoices.length) * 100) : 0

  const trendData = Array.from({ length: 6 }, (_, index) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - index))
    d.setDate(1)
    const label = d.toLocaleDateString('fr-FR', { month: 'short' })
    const total = paidInvoices.filter(inv => {
      const paidDate = inv.paid_at || inv.issue_date
      if (!paidDate) return false
      const date = new Date(paidDate)
      return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()
    }).reduce((sum, inv) => sum + Number(inv.total || 0), 0)
    return { label, total }
  })

  const kpis = [
    { label: 'Revenus collectés', value: fmtXof(totalCollected), hint: 'Sur les factures payées' },
    { label: 'Factures en retard', value: String(overdueInvoices.length), hint: 'À relancer' },
    { label: 'Clients actifs', value: String(clients.length), hint: 'Dans votre portefeuille' },
    { label: 'Taux de collecte', value: `${collectionRate}%`, hint: 'Sur l’ensemble des factures' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Analytique</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 6px' }}>Suivez la santé de votre activité</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Des indicateurs simples pour comprendre votre cash-flow, votre portefeuille clients et vos retards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
            <div style={{ fontSize: 11.5, color: muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: text, letterSpacing: '-0.6px' }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>{kpi.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 0.95fr', gap: 16 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: 0 }}>Évolution des encaissements</h2>
            <span style={{ fontSize: 12, color: muted }}>6 derniers mois</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} fill="url(#analyticsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 10px' }}>Valeur moyenne</h2>
            <div style={{ fontSize: 26, fontWeight: 800, color: text, letterSpacing: '-0.6px' }}>{fmtXof(avgInvoice)}</div>
            <p style={{ fontSize: 13, color: muted, margin: '8px 0 0' }}>Le montant moyen par facture selon votre portefeuille actuel.</p>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 10px' }}>Système de suivi</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: muted, fontSize: 13, lineHeight: 1.7 }}>
              <li>Relance automatique des factures non payées</li>
              <li>Vérification rapide des paiements reçus</li>
              <li>Vue claire sur les clients prioritaires</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
