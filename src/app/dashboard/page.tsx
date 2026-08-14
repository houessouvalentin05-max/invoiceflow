'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardTheme } from '@/app/dashboard/theme-context'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, type InvoiceStatus } from '@/lib/invoice-meta'

const fmtXof = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' XOF'

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

interface InvoiceRow {
  id: string
  invoice_number: string
  total: number
  status: string
  issue_date: string | null
  paid_at: string | null
  client?: { name?: string } | null
}

const KPI_ICONS = {
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
      <circle cx="9" cy="8" r="3.5"/>
      <path d="M3 20c0-3 2.4-5.4 6-5.4s6 2.4 6 5.4"/>
      <path d="M16 8a3 3 0 010 6"/>
      <path d="M21 20c0-2.5-1.8-4.2-4-4.8"/>
    </svg>
  ),
  pct: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
      <path d="M19 5L5 19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string | number }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'#111827',borderRadius:10,padding:'10px 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{fontSize:11,color:'#94A3B8',marginBottom:4}}>{label}</div>
      <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{fmtXof(payload[0]?.value ?? 0)}</div>
    </div>
  )
}

function SkeletonCard({ isDark }: { isDark: boolean }) {
  return (
    <div style={{background: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`, borderRadius:16, padding:22}}>
      <div style={{width:42,height:42,borderRadius:12,background: isDark ? '#1F2937' : '#F1F5F9',marginBottom:14}}/>
      <div style={{width:80,height:10,borderRadius:4,background: isDark ? '#1F2937' : '#F1F5F9',marginBottom:10}}/>
      <div style={{width:120,height:28,borderRadius:6,background: isDark ? '#1F2937' : '#F1F5F9'}}/>
    </div>
  )
}

export default function DashboardPage() {
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#fff'
  const surfaceSoft = isDark ? '#1F2937' : '#F8FAFC'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const subtle = isDark ? '#1E293B' : '#F1F5F9'

  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [chartTab, setChartTab] = useState<'7j'|'30j'|'6m'|'1y'>('7j')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: { user } }, resInv, resCli] = await Promise.all([
        supabase.auth.getUser(),
        fetch('/api/invoices'),
        fetch('/api/clients'),
      ])

      if (!resInv.ok || !resCli.ok) {
        setLoading(false)
        return
      }

      const inv: InvoiceRow[] = await resInv.json()
      const clients: unknown[] = await resCli.json()
      setEmail(user?.email || '')
      setInvoices(inv || [])
      setClientsCount((clients || []).length)
      setLoading(false)
    }
    void load()
  }, [])

  const now = new Date()
  const curMonth = now.getMonth()
  const curYear = now.getFullYear()
  const prevMonth = new Date(curYear, curMonth - 1, 1).getMonth()
  const prevYear = new Date(curYear, curMonth - 1, 1).getFullYear()

  const paidDate = (i: InvoiceRow) => {
    const d = i.paid_at ?? i.issue_date
    return d ? new Date(d) : null
  }
  const paidInvoices = invoices.filter(i => i.status === 'paid' && paidDate(i))
  const inMonth = (d: Date, m: number, y: number) => d.getMonth() === m && d.getFullYear() === y

  const monthRevenue = paidInvoices.filter(i => inMonth(paidDate(i)!, curMonth, curYear)).reduce((s, i) => s + Number(i.total || 0), 0)
  const prevRevenue = paidInvoices.filter(i => inMonth(paidDate(i)!, prevMonth, prevYear)).reduce((s, i) => s + Number(i.total || 0), 0)
  const pendingCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length
  const paidThisMonth = paidInvoices.filter(i => inMonth(paidDate(i)!, curMonth, curYear)).length
  const paidPrevMonth = paidInvoices.filter(i => inMonth(paidDate(i)!, prevMonth, prevYear)).length

  const trend = (cur: number, prev: number) => {
    if (prev === 0) return null
    const pct = Math.round(((cur - prev) / prev) * 100)
    return { pct, up: pct >= 0 }
  }

  const firstName = (email.split('@')[0] || '').replace(/[._-]/g, ' ').split(' ')[0]
  const greet = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : ''
  const recent = invoices.slice(0, 6)

  const chartData = (() => {
    const paid = invoices.filter(i => i.status === 'paid' && (i.paid_at ?? i.issue_date))
    const getDate = (i: InvoiceRow) => new Date((i.paid_at ?? i.issue_date)!)

    const buildDaily = (days: number) => {
      return Array.from({ length: days }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - k))
        const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        const total = paid.filter(i => {
          const p = getDate(i)
          return p.getFullYear() === d.getFullYear() && p.getMonth() === d.getMonth() && p.getDate() === d.getDate()
        }).reduce((s, i) => s + Number(i.total || 0), 0)
        return { label, total }
      })
    }

    const buildMonthly = (months: number) => {
      return Array.from({ length: months }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - k), 1)
        const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        const total = paid.filter(i => {
          const p = getDate(i)
          return p.getMonth() === d.getMonth() && p.getFullYear() === d.getFullYear()
        }).reduce((s, i) => s + Number(i.total || 0), 0)
        return { label, total }
      })
    }

    if (chartTab === '7j') return buildDaily(7)
    if (chartTab === '30j') return buildDaily(30)
    if (chartTab === '6m') return buildMonthly(6)
    return buildMonthly(12)
  })()

  const kpis = [
    { label: 'Revenus ce mois', value: fmtXof(monthRevenue), icon: 'revenue', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', trend: trend(monthRevenue, prevRevenue) },
    { label: 'En attente', value: String(pendingCount), icon: 'clock', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', trend: null },
    { label: 'Total clients', value: String(clientsCount), icon: 'users', color: '#10B981', bg: 'rgba(16,185,129,0.1)', trend: null },
    { label: 'Payées ce mois', value: String(paidThisMonth), icon: 'pct', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', trend: trend(paidThisMonth, paidPrevMonth) },
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:28}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:800,color:text,letterSpacing:'-0.7px',margin:'0 0 4px'}}>
            Bonjour 👋{greet ? `, ${greet}` : ''}
          </h1>
          <p style={{fontSize:14,color:muted,margin:0}}>Voici un aperçu de votre activité.</p>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Link href="/dashboard/clients" style={{height:40,padding:'0 16px',borderRadius:10,border:`1px solid ${border}`,background:surface,color:text,fontSize:13,fontWeight:600,display:'inline-flex',alignItems:'center',gap:6,textDecoration:'none'}}>
            + Nouveau client
          </Link>
          <Link href="/dashboard/invoices/new" style={{height:40,padding:'0 16px',borderRadius:10,background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',fontSize:13,fontWeight:600,display:'inline-flex',alignItems:'center',gap:6,textDecoration:'none',boxShadow:'0 4px 14px -4px rgba(79,70,229,0.5)'}}>
            + Nouvelle facture
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
        {loading ? (
          <>{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} isDark={isDark}/>)}</>
        ) : kpis.map((k, idx) => (
          <div key={k.label} style={{
              background:surface,border:`1px solid ${border}`,borderRadius:16,padding:22,
              animation:`fadeUp 0.4s ease-out ${idx * 0.08}s both`,
              transformStyle:'preserve-3d',transition:'all 0.3s ease',cursor:'default',
              boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform='translateY(-4px) rotateX(3deg) rotateY(-2deg)'
              e.currentTarget.style.boxShadow=isDark ? '0 20px 40px -14px rgba(2, 6, 23, 0.55)' : '0 20px 40px -12px rgba(124,58,237,0.25)'
              e.currentTarget.style.borderColor=isDark ? '#475569' : '#DDD6FE'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform='translateY(0) rotateX(0) rotateY(0)'
              e.currentTarget.style.boxShadow=isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)'
              e.currentTarget.style.borderColor=border
            }}
              >
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:k.bg,color:k.color,display:'grid',placeItems:'center'}}>
                {KPI_ICONS[k.icon as keyof typeof KPI_ICONS]}
              </div>
              {k.trend && (
                <span style={{fontSize:11.5,fontWeight:600,padding:'3px 8px',borderRadius:6,background:k.trend.up?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',color:k.trend.up?'#059669':'#DC2626'}}>
                  {k.trend.up ? '↑' : '↓'} {Math.abs(k.trend.pct)}%
                </span>
              )}
            </div>
            <div style={{fontSize:11.5,color:muted,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:28,fontWeight:800,color:text,letterSpacing:'-0.8px',lineHeight:1}}>{k.value}</div>
            <div style={{fontSize:12,color:isDark ? '#94A3B8' : '#94A3B8',marginTop:8}}>vs mois dernier</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{background:surface,border:`1px solid ${border}`,borderRadius:16,padding:24,boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <h2 style={{fontSize:15,fontWeight:700,color:text,margin:0}}>Aperçu des revenus</h2>
          <div style={{display:'inline-flex',gap:4,background:subtle,padding:3,borderRadius:9}}>
            {(['7j','30j','6m','1y'] as const).map(t => (
              <button key={t} onClick={() => setChartTab(t)} style={{
                padding:'6px 12px',fontSize:12,fontWeight:600,borderRadius:7,border:'none',cursor:'pointer',fontFamily:'inherit',
                background:chartTab===t?surface:'transparent',
                color:chartTab===t?text:muted,
                boxShadow:chartTab===t?'0 1px 3px rgba(0,0,0,0.08)':'none',
                transition:'all 0.2s'
              }}>
                {t === '6m' ? '6 mois' : t === '1y' ? '1 an' : t}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{top:5,right:10,left:10,bottom:0}}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F1F5F9'} vertical={false}/>
            <XAxis dataKey="label" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v => v === 0 ? '0' : `${Math.round(v/1000)}k`} tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false} width={40}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="total" stroke="url(#lineGrad)" strokeWidth={2.5} fill="url(#grad)" dot={{r:4,fill:'#fff',stroke:'#4F46E5',strokeWidth:2}} activeDot={{r:6,fill:'#fff',stroke:'#2563EB',strokeWidth:2.5}}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent invoices */}
      <div style={{background:surface,border:`1px solid ${border}`,borderRadius:16,overflow:'hidden',boxShadow: isDark ? '0 10px 24px -18px rgba(2, 6, 23, 0.65)' : '0 10px 24px -18px rgba(15, 23, 42, 0.2)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:`1px solid ${isDark ? '#334155' : '#F1F5F9'}`,background:surfaceSoft}}>
          <h2 style={{fontSize:15,fontWeight:700,color:text,margin:0}}>Factures récentes</h2>
          <Link href="/dashboard/invoices" style={{fontSize:13,color:'#2563EB',fontWeight:600,textDecoration:'none'}}>Voir tout →</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{padding:'56px 24px',textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:16,background:'rgba(37,99,235,0.08)',display:'grid',placeItems:'center',margin:'0 auto 16px'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
                <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/>
                <path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>
              </svg>
            </div>
            <h3 style={{fontSize:15,fontWeight:700,color:'#0F172A',margin:'0 0 6px'}}>Aucune facture pour le moment</h3>
            <p style={{fontSize:13,color:'#64748B',margin:'0 0 20px'}}>Créez votre première facture pour commencer.</p>
            <Link href="/dashboard/invoices/new" style={{display:'inline-flex',alignItems:'center',gap:6,height:38,padding:'0 16px',background:'linear-gradient(135deg,#2563EB,#7C3AED)',color:'#fff',borderRadius:10,fontSize:13,fontWeight:600,textDecoration:'none'}}>
              + Créer une facture
            </Link>
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['N° Facture','Client','Montant','Statut','Date','Actions'].map(h => (
                  <th key={h} style={{padding:'12px 20px',fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.8px',textAlign:'left',borderBottom:`1px solid ${border}`,background:surfaceSoft}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((inv: InvoiceRow) => (
                <tr key={inv.id} style={{borderBottom:`1px solid ${isDark ? '#334155' : '#F1F5F9'}`,transition:'background 0.15s'}}
                  onMouseEnter={e => (e.currentTarget.style.background=surfaceSoft)}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                >
                  <td style={{padding:'16px 20px',fontSize:13,fontWeight:600,color:text,fontFamily:'monospace'}}>{inv.invoice_number}</td>
                  <td style={{padding:'16px 20px',fontSize:13,color:muted}}>{inv.client?.name || '—'}</td>
                  <td style={{padding:'16px 20px',fontSize:13,fontWeight:700,color:text}}>{fmtXof(Number(inv.total || 0))}</td>
                  <td style={{padding:'16px 20px'}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:999,fontSize:11.5,fontWeight:600,background:INVOICE_STATUS_COLORS[inv.status as InvoiceStatus]?.bg||'#F1F5F9',color:INVOICE_STATUS_COLORS[inv.status as InvoiceStatus]?.color||'#475569'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>
                      {INVOICE_STATUS_LABELS[inv.status as InvoiceStatus]||inv.status}
                    </span>
                  </td>
                  <td style={{padding:'16px 20px',fontSize:13,color:muted}}>{fmtDate(inv.issue_date)}</td>
                  <td style={{padding:'16px 20px'}}>
                    <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      <Link href={`/dashboard/invoices/${inv.id}`} style={{width:30,height:30,borderRadius:8,border:`1px solid ${border}`,background:surface,display:'grid',placeItems:'center',textDecoration:'none',color:muted}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>
                    </div>
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