'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ToastState = { type: 'success' | 'error'; message: string } | null

type ProfileState = {
  full_name: string
  email: string
  phone: string
  company_name: string
  company_address: string
  tax_number: string
  website: string
  default_currency: string
  default_tva: string
  invoice_prefix: string
  language: string
  timezone: string
  date_format: string
  auto_payment_reminder_7d: boolean
  auto_payment_reminder_30d: boolean
  auto_thank_you_email: boolean
  email_notifications: boolean
  push_notifications: boolean
}

const initialProfile: ProfileState = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  company_address: '',
  tax_number: '',
  website: '',
  default_currency: 'XOF',
  default_tva: '18',
  invoice_prefix: 'INV',
  language: 'Français',
  timezone: 'Africa/Lome',
  date_format: 'DD/MM/YYYY',
  auto_payment_reminder_7d: true,
  auto_payment_reminder_30d: false,
  auto_thank_you_email: true,
  email_notifications: true,
  push_notifications: false,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  border: '1px solid #E2E8F0',
  borderRadius: 10,
  padding: '0 14px',
  fontSize: 14,
  color: '#0F172A',
  background: '#F8FAFC',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 10px 30px -18px rgba(15, 23, 42, 0.22)',
}

function SectionCard({ title, description, icon, onSave, saveLabel = 'Enregistrer', saving = false, children }: { title: string; description: string; icon: React.ReactNode; onSave?: () => void; saveLabel?: string; saving?: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 38px -22px rgba(15, 23, 42, 0.28)' : '0 10px 30px -18px rgba(15, 23, 42, 0.22)',
        borderColor: hovered ? '#CBD5E1' : '#E2E8F0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(37, 99, 235, 0.08)', display: 'grid', placeItems: 'center', color: '#2563EB', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#111827' }}>{title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{description}</p>
          </div>
        </div>
        {onSave && (
          <button type="button" onClick={onSave} disabled={saving} style={{ ...buttonPrimaryStyle, height: 40, padding: '0 16px', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Enregistrement…' : saveLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{hint}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        style={{
          width: 48,
          height: 28,
          borderRadius: 999,
          border: 'none',
          background: checked ? '#2563EB' : '#CBD5E1',
          cursor: 'pointer',
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(15,23,42,0.16)' }} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileState>(initialProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<ToastState>(null)
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setToast({ type: 'error', message: 'Veuillez vous reconnecter pour voir vos paramètres.' })
        setLoading(false)
        return
      }

      const res = await fetch('/api/profile')
      const data = res.ok ? await res.json() : null

      if (data) {
        setProfile((prev) => ({
          ...prev,
          full_name: data.full_name || prev.full_name,
          email: data.email || user.email || prev.email,
          phone: data.phone || prev.phone,
          company_name: data.company_name || prev.company_name,
          company_address: data.company_address || prev.company_address,
          tax_number: data.tax_number || prev.tax_number,
          website: data.website || prev.website,
          default_currency: data.default_currency || prev.default_currency,
          default_tva: data.default_tva || prev.default_tva,
          invoice_prefix: data.invoice_prefix || prev.invoice_prefix,
          language: data.language || prev.language,
          timezone: data.timezone || prev.timezone,
          date_format: data.date_format || prev.date_format,
          auto_payment_reminder_7d: data.auto_payment_reminder_7d ?? prev.auto_payment_reminder_7d,
          auto_payment_reminder_30d: data.auto_payment_reminder_30d ?? prev.auto_payment_reminder_30d,
          auto_thank_you_email: data.auto_thank_you_email ?? prev.auto_thank_you_email,
          email_notifications: data.email_notifications ?? prev.email_notifications,
          push_notifications: data.push_notifications ?? prev.push_notifications,
        }))
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const saveSection = async (section: string, payload: Partial<ProfileState>, successMessage: string) => {
    setSaving((prev) => ({ ...prev, [section]: true }))
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setToast({ type: 'error', message: body.error || 'Erreur lors de l’enregistrement.' })
        return
      }

      setProfile((prev) => ({ ...prev, ...payload }))
      setToast({ type: 'success', message: successMessage })
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }))
    }
  }

  const handleProfileSave = () => {
    saveSection('profile', {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
    }, 'Profil mis à jour avec succès.')
  }

  const handleCompanySave = () => {
    saveSection('entreprise', {
      company_name: profile.company_name,
      company_address: profile.company_address,
      tax_number: profile.tax_number,
      website: profile.website,
    }, 'Informations entreprise enregistrées.')
  }

  const handleBillingSave = () => {
    saveSection('billing', {
      default_currency: profile.default_currency,
      default_tva: profile.default_tva,
      invoice_prefix: profile.invoice_prefix,
    }, 'Préférences de facturation enregistrées.')
  }

  const handleLocaleSave = () => {
    saveSection('locale', {
      language: profile.language,
      timezone: profile.timezone,
      date_format: profile.date_format,
    }, 'Langue et région mises à jour.')
  }

  const handleAutomationSave = () => {
    saveSection('automation', {
      auto_payment_reminder_7d: profile.auto_payment_reminder_7d,
      auto_payment_reminder_30d: profile.auto_payment_reminder_30d,
      auto_thank_you_email: profile.auto_thank_you_email,
    }, 'Automatisations enregistrées.')
  }

  const handleNotificationSave = () => {
    saveSection('notifications', {
      email_notifications: profile.email_notifications,
      push_notifications: profile.push_notifications,
    }, 'Préférences de notification enregistrées.')
  }

  const handlePasswordUpdate = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!passwords.password.trim()) {
      setToast({ type: 'error', message: 'Le mot de passe ne peut pas être vide.' })
      return
    }
    if (passwords.password !== passwords.confirmPassword) {
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }

    setPasswordLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwords.password })
    setPasswordLoading(false)

    if (error) {
      setToast({ type: 'error', message: error.message })
      return
    }

    setToast({ type: 'success', message: 'Mot de passe mis à jour avec succès.' })
    setPasswords({ password: '', confirmPassword: '' })
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Cette action supprimera votre compte et toutes les données associées. Confirmer ?')
    if (!confirmed) return

    setDeleting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setToast({ type: 'error', message: 'Impossible de retrouver votre session.' })
      setDeleting(false)
      return
    }

    const { error } = await supabase.rpc('delete_user_account', { user_id: user.id })
    setDeleting(false)

    if (error) {
      setToast({ type: 'error', message: error.message || 'La suppression du compte a échoué.' })
      return
    }

    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.7px' }}>Paramètres</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Gérez votre profil, votre entreprise, vos préférences de facturation et votre sécurité.</p>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1000,
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${toast.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
          background: toast.type === 'success' ? '#ECFDF3' : '#FEF2F2',
          color: toast.type === 'success' ? '#166534' : '#B91C1C',
          animation: 'fadeUp 0.25s ease-out',
          boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.28)',
        }}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748B', padding: '32px 24px' }}>Chargement de vos paramètres…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard title="Profil" description="Mettez à jour vos informations personnelles pour votre compte." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/></svg>} onSave={handleProfileSave} saving={saving.profile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input value={profile.full_name} onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))} style={inputStyle} placeholder="Jean Dupont" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} style={inputStyle} placeholder="jean@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} style={inputStyle} placeholder="+228 90 00 00 00" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Entreprise" description="Ajoutez les détails de votre structure pour vos factures." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M9 16h2"/><path d="M13 16h2"/></svg>} onSave={handleCompanySave} saving={saving.entreprise}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nom de l’entreprise</label>
                <input value={profile.company_name} onChange={(e) => setProfile((prev) => ({ ...prev, company_name: e.target.value }))} style={inputStyle} placeholder="InvoiceFlow SARL" />
              </div>
              <div>
                <label style={labelStyle}>Adresse</label>
                <input value={profile.company_address} onChange={(e) => setProfile((prev) => ({ ...prev, company_address: e.target.value }))} style={inputStyle} placeholder="Lomé, Togo" />
              </div>
              <div>
                <label style={labelStyle}>Numéro fiscal</label>
                <input value={profile.tax_number} onChange={(e) => setProfile((prev) => ({ ...prev, tax_number: e.target.value }))} style={inputStyle} placeholder="TG123456" />
              </div>
              <div>
                <label style={labelStyle}>Site web</label>
                <input value={profile.website} onChange={(e) => setProfile((prev) => ({ ...prev, website: e.target.value }))} style={inputStyle} placeholder="https://example.com" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Facturation" description="Définissez vos préférences par défaut pour les factures." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M3 7h18"/><path d="M7 3v18"/><path d="M17 3v18"/><rect x="5" y="11" width="14" height="8" rx="2"/></svg>} onSave={handleBillingSave} saving={saving.billing}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Devise par défaut</label>
                <select value={profile.default_currency} onChange={(e) => setProfile((prev) => ({ ...prev, default_currency: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="XOF">XOF</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>TVA par défaut (%)</label>
                <input type="number" min="0" step="0.01" value={profile.default_tva} onChange={(e) => setProfile((prev) => ({ ...prev, default_tva: e.target.value }))} style={inputStyle} placeholder="18" />
              </div>
              <div>
                <label style={labelStyle}>Préfixe du numéro de facture</label>
                <input value={profile.invoice_prefix} onChange={(e) => setProfile((prev) => ({ ...prev, invoice_prefix: e.target.value }))} style={inputStyle} placeholder="INV" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Langue & Région" description="Choisissez votre langue, fuseau horaire et format de date." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z"/></svg>} onSave={handleLocaleSave} saving={saving.locale}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Langue</label>
                <select value={profile.language} onChange={(e) => setProfile((prev) => ({ ...prev, language: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fuseau horaire</label>
                <select value={profile.timezone} onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Africa/Lome">Africa/Lome</option>
                  <option value="Africa/Abidjan">Africa/Abidjan</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Format de date</label>
                <select value={profile.date_format} onChange={(e) => setProfile((prev) => ({ ...prev, date_format: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Automatisations" description="Activez les rappels et emails automatiques liés aux paiements." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>} onSave={handleAutomationSave} saving={saving.automation}>
            <ToggleSwitch checked={profile.auto_payment_reminder_7d} onChange={() => setProfile((prev) => ({ ...prev, auto_payment_reminder_7d: !prev.auto_payment_reminder_7d }))} label="Rappels de paiement après 7 jours" hint="Envoyer un rappel automatiquement après 7 jours." />
            <ToggleSwitch checked={profile.auto_payment_reminder_30d} onChange={() => setProfile((prev) => ({ ...prev, auto_payment_reminder_30d: !prev.auto_payment_reminder_30d }))} label="Rappels de paiement après 30 jours" hint="Envoyer un rappel automatiquement après 30 jours." />
            <ToggleSwitch checked={profile.auto_thank_you_email} onChange={() => setProfile((prev) => ({ ...prev, auto_thank_you_email: !prev.auto_thank_you_email }))} label="Email de remerciement après paiement" hint="Envoyer un message de remerciement lors d’un paiement reçu." />
          </SectionCard>

          <SectionCard title="Notifications" description="Contrôlez les notifications liées à votre compte." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>} onSave={handleNotificationSave} saving={saving.notifications}>
            <ToggleSwitch checked={profile.email_notifications} onChange={() => setProfile((prev) => ({ ...prev, email_notifications: !prev.email_notifications }))} label="Notifications par email" hint="Recevoir des emails de suivi et d’alerte." />
            <ToggleSwitch checked={profile.push_notifications} onChange={() => setProfile((prev) => ({ ...prev, push_notifications: !prev.push_notifications }))} label="Notifications push" hint="Recevoir des notifications en temps réel." />
          </SectionCard>

          <SectionCard title="Sécurité" description="Modifiez votre mot de passe pour renforcer la sécurité du compte." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 8V7a4 4 0 118 0v1"/></svg>} onSave={handlePasswordUpdate} saving={passwordLoading} saveLabel="Enregistrer">
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <input type="password" value={passwords.password} onChange={(e) => setPasswords((prev) => ({ ...prev, password: e.target.value }))} style={inputStyle} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))} style={inputStyle} placeholder="••••••••" />
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Zone de danger" description="Supprimez définitivement votre compte et vos données." icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M10 11v6"/><path d="M14 11v6"/><path d="M4 7h16"/><path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"/><path d="M9 7V4h6v3"/></svg>} onSave={handleDeleteAccount} saving={deleting} saveLabel="Supprimer">
            <div style={{ border: '1px solid #FECACA', borderRadius: 12, padding: 16, background: '#FEF2F2' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', marginBottom: 8 }}>Action irréversible</div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#7F1D1D', lineHeight: 1.6 }}>La suppression du compte effacera vos données de profil et vous déconnectera immédiatement.</p>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{
                height: 40,
                padding: '0 16px',
                borderRadius: 10,
                border: 'none',
                background: '#DC2626',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.7 : 1,
                fontFamily: 'inherit',
              }}>
                {deleting ? 'Suppression…' : 'Supprimer mon compte'}
              </button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}

const buttonPrimaryStyle: React.CSSProperties = {
  height: 40,
  padding: '0 16px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  fontFamily: 'inherit',
  boxShadow: '0 8px 18px -10px rgba(37, 99, 235, 0.45)',
}
