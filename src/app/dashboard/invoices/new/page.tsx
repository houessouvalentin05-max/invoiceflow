'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthenticatedClient } from '@/lib/supabase/client'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

interface Client { id: string; name: string }
interface Item { description: string; quantity: number; unit_price: number }

export default function NewInvoicePage() {
  const router = useRouter()
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#ffffff'
  const surfaceSoft = isDark ? '#1F2937' : '#F8FAFC'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const accent = '#2563EB'

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42, border: `1px solid ${border}`, borderRadius: 10,
    padding: '0 14px', fontSize: 14, color: text, background: surfaceSoft,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s'
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: muted, marginBottom: 6
  }
  const sectionStyle: React.CSSProperties = {
    background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24,
    boxShadow: isDark ? '0 10px 28px -18px rgba(2, 6, 23, 0.65)' : '0 10px 28px -18px rgba(15, 23, 42, 0.25)'
  }

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_id: '',
    invoice_number: `FAC-${Math.floor(Math.random() * 900000 + 100000)}`,
    currency: 'XOF',
    due_date: '',
    status: 'draft',
    notes: '',
  })
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  useEffect(() => {
    let active = true

    async function loadClients() {
      try {
        const supabase = await getAuthenticatedClient()
        const { data, error } = await supabase.from('clients').select('id,name').order('name')

        if (!active) return

        if (error) {
          console.error('Erreur chargement clients:', error)
          return
        }

        setClients(data || [])
      } catch (err) {
        console.error('Erreur session clients:', err)
      }
    }

    loadClients()

    return () => {
      active = false
    }
  }, [])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof Item, value: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) { setError('Veuillez sélectionner un client.'); return }
    if (form.status === 'paid' && total === 0) { setError('Le montant doit être supérieur à 0 pour une facture payée.'); return }
    setLoading(true)
    setError(null)
    const supabase = await getAuthenticatedClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Vous devez être connecté pour créer une facture.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.from('invoices').insert({
      user_id: user?.id,
      client_id: form.client_id,
      invoice_number: form.invoice_number,
      currency: form.currency,
      due_date: form.due_date || null,
      status: form.status,
      total: total,
      subtotal: subtotal,
      tax: tax,
      issue_date: new Date().toISOString().split('T')[0],
      notes: form.notes || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard/invoices')
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: muted, fontWeight: 600, fontFamily: 'inherit', padding: 0, marginBottom: 12 }}>
          ← Retour
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Nouvelle facture</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 6px' }}>Créer une facture</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Remplissez les informations ci-dessous pour générer une facture professionnelle et prête à envoyer.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 20px' }}>Informations générales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Client <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} required
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Sélectionner un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>N° Facture <span style={{ color: '#DC2626' }}>*</span></label>
              <input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} required style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>

            <div>
              <label style={labelStyle}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="draft">Brouillon</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Date d'échéance</label>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>

            <div>
              <label style={labelStyle}>Devise</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: 0 }}>Articles</h2>
            <button type="button" onClick={addItem} style={{ height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${border}`, background: surfaceSoft, fontSize: 13, fontWeight: 600, color: accent, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Ajouter une ligne
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 32px', gap: 10, marginBottom: 8 }}>
            {['Description', 'Qté', 'Prix unitaire', 'Total', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 32px', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                placeholder="Description de l'article" required style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = border} />
              <input type="number" value={item.quantity} min={1} onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                style={{ ...inputStyle, padding: '0 10px', textAlign: 'center' }}
                onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = border} />
              <input type="number" value={item.unit_price} min={0} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                placeholder="0" style={{ ...inputStyle, padding: '0 10px' }}
                onFocus={e => e.currentTarget.style.borderColor = accent} onBlur={e => e.currentTarget.style.borderColor = border} />
              <div style={{ fontSize: 13, fontWeight: 700, color: text, textAlign: 'right' }}>
                {fmtNum(item.quantity * item.unit_price)}
              </div>
              {items.length > 1 ? (
                <button type="button" onClick={() => removeItem(i)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>✕</button>
              ) : <div />}
            </div>
          ))}
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Notes / Conditions (optionnel)</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Conditions de paiement, remerciements..."
            style={{ ...inputStyle, height: 80, padding: '10px 14px', resize: 'vertical' as const }} />
        </div>

        <div style={{ ...sectionStyle, background: isDark ? 'linear-gradient(135deg,#111827,#1D4ED8)' : 'linear-gradient(135deg,#F8FAFC,#EEF2FF)' }}>
          <div style={{ maxWidth: 320, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: isDark ? '#CBD5E1' : '#64748B' }}>
              <span>Sous-total</span>
              <span style={{ fontWeight: 600, color: text }}>{fmtNum(subtotal)} {form.currency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: isDark ? '#CBD5E1' : '#64748B' }}>
              <span>TVA (18%)</span>
              <span style={{ fontWeight: 600, color: text }}>{fmtNum(tax)} {form.currency}</span>
            </div>
            <div style={{ height: 1, background: isDark ? '#334155' : '#E2E8F0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: text, letterSpacing: '-0.5px' }}>
              <span>Total</span>
              <span style={{ color: isDark ? '#BFDBFE' : '#2563EB' }}>{fmtNum(total)} {form.currency}</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="submit" disabled={loading} style={{
            height: 44, padding: '0 24px', borderRadius: 10,
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff',
            fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
            boxShadow: '0 4px 14px -4px rgba(79,70,229,0.5)', transition: 'all 0.2s'
          }}>
            {loading ? 'Création...' : 'Créer la facture →'}
          </button>
          <button type="button" onClick={() => router.back()} style={{
            height: 44, padding: '0 20px', borderRadius: 10, border: `1px solid ${border}`,
            background: surface, color: muted, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}