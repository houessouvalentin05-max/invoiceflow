'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string; name: string; email: string; phone: string | null
  company: string | null; address: string | null; created_at: string
}

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '' }

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, border: '1px solid #E2E8F0', borderRadius: 10,
  padding: '0 14px', fontSize: 14, color: '#0F172A', background: '#F8FAFC',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s'
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6
}

const COLORS = ['#2563EB','#7C3AED','#10B981','#F59E0B','#EF4444','#06B6D4','#8B5CF6','#EC4899']
const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  async function fetchClients() {
    const { data } = await createClient().from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('clients').insert({
      user_id: user?.id,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
    fetchClients()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce client ?')) return
    await createClient().from('clients').delete().eq('id', id)
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const filtered = useMemo(() =>
    clients.filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
    ), [clients, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px', margin: '0 0 4px' }}>Clients</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>{clients.length} client{clients.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          height: 40, padding: '0 18px', borderRadius: 10,
          background: showForm ? '#fff' : 'linear-gradient(135deg,#2563EB,#7C3AED)',
          color: showForm ? '#0F172A' : '#fff', fontSize: 13, fontWeight: 600,
          border: showForm ? '1px solid #E2E8F0' : 'none', cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: showForm ? 'none' : '0 4px 14px -4px rgba(79,70,229,0.5)',
          transition: 'all 0.2s'
        }}>
          {showForm ? '✕ Fermer' : '+ Nouveau client'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, animation: 'fadeUp 0.3s ease-out' }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>Nouveau client</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Nom <span style={{ color: '#DC2626' }}>*</span></label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Dupont" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="jean@example.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+228 90 00 00 00" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label style={labelStyle}>Entreprise <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>optionnel</span></label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="Nom de l'entreprise" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Adresse</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Lomé, Togo" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
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
                {saving ? 'Enregistrement...' : 'Enregistrer le client'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} style={{
                height: 40, padding: '0 16px', borderRadius: 10, border: '1px solid #E2E8F0',
                background: '#fff', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + View toggle */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 }}>
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..."
            style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 9, padding: 3, gap: 3 }}>
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              width: 34, height: 34, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: view === v ? '#fff' : 'transparent',
              color: view === v ? '#0F172A' : '#94A3B8',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'grid', placeItems: 'center', transition: 'all 0.2s'
            }}>
              {v === 'grid' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(37,99,235,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
              <circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.4-5.4 6-5.4s6 2.4 6 5.4"/>
              <path d="M16 8a3 3 0 010 6"/><path d="M21 20c0-2.5-1.8-4.2-4-4.8"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
            {search ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>
            {search ? 'Essayez un autre terme de recherche.' : 'Ajoutez votre premier client pour commencer.'}
          </p>
          {!search && (
            <button onClick={() => setShowForm(true)} style={{
              height: 38, padding: '0 16px', borderRadius: 10,
              background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}>+ Ajouter un client</button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 22,
              transition: 'all 0.25s', position: 'relative', cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 32px -16px rgba(17,24,39,0.2)'; e.currentTarget.style.borderColor = '#CBD5E1' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: getColor(c.name), color: '#fff', fontWeight: 700, fontSize: 16, display: 'grid', placeItems: 'center', marginBottom: 14, letterSpacing: '-0.5px' }}>
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{c.name}</h3>
              {c.company && <p style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, margin: '0 0 4px' }}>{c.company}</p>}
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</p>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 16px' }}>{c.phone || '—'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Client', 'Email', 'Téléphone', 'Entreprise', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: getColor(c.name), color: '#fff', fontWeight: 700, fontSize: 12, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>{c.email || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#7C3AED', fontWeight: 500 }}>{c.company || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}