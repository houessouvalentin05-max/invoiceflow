'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { GUEST_INVOICE_FINALIZE_PATH } from '@/lib/auth-redirect'
import {
  GUEST_CLIENT_ID_KEY,
  GUEST_INVOICE_ID_KEY,
  guestInvoiceDraftSchema,
  loadGuestInvoiceDraft,
  storeGuestInvoiceDraft,
  type GuestInvoiceDraft,
} from '@/features/invoices/guest-draft'
import { createClient } from '@/lib/supabase/client'
import { useIsMobile } from '@/lib/use-viewport'

const inputStyle = {
  width: '100%', minHeight: 42, border: '1px solid #E2E8F0', borderRadius: 10,
  padding: '0 14px', fontSize: 14, color: '#0F172A', background: '#F8FAFC',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
} as const

function formatMoney(value: number, currency: string) {
  // 2 décimales max : les lignes à décimales (ex. 0,5 h) restent lisibles
  // et additionnent visuellement avec le sous-total affiché.
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value) + ` ${currency}`
}

/** Formulaire local : les champs numériques restent des strings tant que
 * l'utilisateur tape, pour qu'un champ vidé affiche « » et non 0. */
interface FormItem {
  description: string
  quantity: string
  unit_price: string
}

interface FormState {
  client: { name: string; email: string }
  currency: GuestInvoiceDraft['currency']
  due_date: string
  notes: string
  items: FormItem[]
}

function toNumber(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value)
}

function lineTotal(item: FormItem) {
  const quantity = toNumber(item.quantity)
  const unitPrice = toNumber(item.unit_price)
  return (Number.isFinite(quantity) ? quantity : 0) * (Number.isFinite(unitPrice) ? unitPrice : 0)
}

function toGuestDraft(form: FormState): GuestInvoiceDraft {
  return {
    client: form.client,
    currency: form.currency,
    due_date: form.due_date,
    notes: form.notes,
    items: form.items.map(item => ({
      description: item.description,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.unit_price),
    })),
  }
}

/** Message d'erreur précis quand un champ numérique est resté vide
 * (Zod vérifierait « positive » sur NaN, ce qui prête à confusion). */
function describeIssue(issue: { path: readonly PropertyKey[]; message: string } | undefined, form: FormState) {
  if (!issue) return undefined
  const [root, index, field] = issue.path
  if (root === 'items' && typeof index === 'number' && typeof field === 'string') {
    if (form.items[index]?.[field as keyof FormItem] === '') {
      const label = field === 'quantity' ? 'Quantité' : field === 'unit_price' ? 'Prix unitaire' : 'Description'
      return `${label} requis pour l'article ${index + 1}.`
    }
  }
  return issue.message
}

/** Déplace le focus et la vue vers le premier champ en erreur (F3). */
function focusField(path: readonly PropertyKey[]) {
  const [root, index, field] = path
  let target: HTMLElement | null = null
  if (root === 'client' && (index === 'name' || index === 'email')) {
    // path = ['client', 'name' | 'email'] : le champ est en position 1.
    target = document.getElementById(`client-${index}`)
  } else if (root === 'items' && typeof index === 'number') {
    // path = ['items', <index>, <champ>] : le champ est en position 2.
    const label = field === 'quantity' ? 'Quantité' : field === 'unit_price' ? 'Prix' : 'Description'
    target = document.querySelector<HTMLElement>(`[aria-label="${label} article ${index + 1}"]`)
  } else if (root === 'due_date') {
    target = document.getElementById('due-date')
  }
  if (!target) return
  target.focus()
  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

/** Abonne aux bascules de thème (bouton du dashboard, script du layout racine). */
function subscribeTheme(onThemeChange: () => void) {
  const observer = new MutationObserver(onThemeChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export default function GuestInvoicePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  // data-theme est posé AVANT l'hydratation (script theme-init du layout racine) :
  // le snapshot client est donc appliqué avant le premier paint — pas de flash de
  // palette claire en mode sombre. Le snapshot serveur reste « false », le rendu
  // SSR est inchangé.
  const isDark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme === 'dark',
    () => false,
  )
  const palette = isDark
    ? {
        bg: '#080D1A', panel: '#182338', soft: '#0F172A', text: '#F8FAFC', muted: '#CBD5E1',
        border: '#334155', inputText: '#F8FAFC', accent: '#93C5FD', cardShadow: '0 18px 42px rgba(0,0,0,0.28)',
        dangerBg: 'rgba(127,29,29,0.24)', dangerBorder: 'rgba(248,113,113,0.3)', dangerText: '#FCA5A5',
      }
    : {
        bg: '#F8FAFC', panel: '#FFFFFF', soft: '#F8FAFC', text: '#0F172A', muted: '#64748B',
        border: '#E2E8F0', inputText: '#0F172A', accent: '#2563EB', cardShadow: '0 10px 26px rgba(15,23,42,0.06)',
        dangerBg: '#FEF2F2', dangerBorder: '#FECACA', dangerText: '#DC2626',
      }
  const fieldStyle = { ...inputStyle, color: palette.inputText, background: palette.soft, border: `1px solid ${palette.border}`, colorScheme: isDark ? 'dark' as const : 'light' as const }
  const [draft, setDraft] = useState<FormState>({
    client: { name: '', email: '' },
    currency: 'XOF',
    due_date: '',
    notes: '',
    items: [{ description: '', quantity: '1', unit_price: '0' }],
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restoredNotice, setRestoredNotice] = useState(false)

  // Restaure le brouillon déjà enregistré (retour depuis /register par ex.).
  // Repoussé d'un microtask : le rendu serveur et l'hydratation restent
  // identiques, puis le formulaire se pré-remplit avant le premier paint.
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const saved = loadGuestInvoiceDraft()
      if (!saved) return
      setDraft({
        client: saved.client,
        currency: saved.currency,
        due_date: saved.due_date,
        notes: saved.notes,
        items: saved.items.map(item => ({
          description: item.description,
          quantity: String(item.quantity),
          unit_price: String(item.unit_price),
        })),
      })
      setRestoredNotice(true)
    })
    return () => { cancelled = true }
  }, [])

  const subtotal = draft.items.reduce((sum, item) => sum + lineTotal(item), 0)

  function updateItem(index: number, field: keyof FormItem, value: string) {
    setDraft(current => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  async function continueToSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError(null)

    const validated = guestInvoiceDraftSchema.safeParse(toGuestDraft(draft))
    if (!validated.success) {
      const issue = validated.error.issues[0]
      setError(describeIssue(issue, draft) ?? 'Vérifiez les champs de la facture.')
      focusField(issue?.path ?? [])
      return
    }

    if (!storeGuestInvoiceDraft(validated.data)) {
      setError("Impossible d'enregistrer le brouillon dans ce navigateur (stockage plein ou mode privé). Libérez de l'espace puis réessayez.")
      return
    }
    localStorage.removeItem(GUEST_INVOICE_ID_KEY)
    localStorage.removeItem(GUEST_CLIENT_ID_KEY)

    // Vérification du compte : état pending + catch → l'utilisateur voit
    // toujours un retour, même si le réseau échoue (F1).
    setIsSubmitting(true)
    try {
      const { data: { user }, error: authError } = await createClient().auth.getUser()
      if (authError) {
        console.error('auth.getUser', authError)
        setError('Impossible de vérifier votre connexion. Vérifiez votre réseau puis réessayez.')
        return
      }
      const next = encodeURIComponent(GUEST_INVOICE_FINALIZE_PATH)
      router.push(user ? GUEST_INVOICE_FINALIZE_PATH : `/register?next=${next}`)
    } catch (caught) {
      console.error('continueToSave', caught)
      setError('Une erreur est survenue pendant la vérification de votre compte. Vérifiez votre connexion puis réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: palette.bg, color: palette.text, padding: '32px 20px 64px' }}>
      <div style={{ maxWidth: 1020, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ color: palette.text, fontSize: 18, fontWeight: 800, textDecoration: 'none' }}>InvoiceFlow</Link>
          <Link href="/login" style={{ color: palette.muted, fontSize: 14, textDecoration: 'none' }}>Déjà un compte ? Connexion</Link>
        </header>

        <div style={{ maxWidth: 720, marginBottom: 28 }}>
          <p style={{ color: palette.accent, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>Facture sans compte</p>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: '0 0 10px' }}>Préparez votre facture</h1>
          <p style={{ color: palette.muted, margin: 0, lineHeight: 1.6 }}>Renseignez les informations et vérifiez le sous-total. Votre brouillon reste dans ce navigateur. Créez un compte ou connectez-vous pour appliquer vos paramètres de TVA, enregistrer la facture et télécharger le PDF.</p>
        </div>

        <form onSubmit={continueToSave} noValidate style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(260px, .65fr)', gap: 20, alignItems: 'start' }}>
          <section style={{ display: 'grid', gap: 16 }}>
            {restoredNotice && (
              <p role="status" style={{ margin: 0, padding: '10px 14px', borderRadius: 10, fontSize: 13, color: palette.accent, background: palette.soft, border: `1px solid ${palette.border}` }}>
                Brouillon restauré depuis ce navigateur.
              </p>
            )}
            {error && (
              <p role="alert" style={{ margin: 0, padding: '10px 14px', borderRadius: 10, fontSize: 13, color: palette.dangerText, background: palette.dangerBg, border: `1px solid ${palette.dangerBorder}` }}>
                {error}
              </p>
            )}
            <div style={{ background: palette.panel, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 24, boxShadow: palette.cardShadow }}>
              <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Client</h2>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                Nom du client
                <input id="client-name" required value={draft.client.name} onChange={event => setDraft(current => ({ ...current, client: { ...current.client, name: event.target.value } }))} style={{ ...fieldStyle, display: 'block', marginTop: 6 }} />
              </label>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
                Email du client (facultatif)
                <input id="client-email" type="email" value={draft.client.email} onChange={event => setDraft(current => ({ ...current, client: { ...current.client, email: event.target.value } }))} style={{ ...fieldStyle, display: 'block', marginTop: 6 }} />
              </label>
            </div>

            <div style={{ background: palette.panel, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 24, boxShadow: palette.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, margin: 0 }}>Articles</h2>
                <label style={{ fontSize: 12, color: palette.muted }}>
                  Devise{' '}
                  <select value={draft.currency} onChange={event => setDraft(current => ({ ...current, currency: event.target.value as GuestInvoiceDraft['currency'] }))} style={{ ...fieldStyle, width: 105, minHeight: 34, padding: '5px 8px' }}>
                    <option value="XOF">XOF</option><option value="EUR">EUR</option><option value="USD">USD</option>
                  </select>
                </label>
              </div>
              {draft.items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr) 64px 34px' : 'minmax(120px, 1fr) 70px 130px 34px', gap: 8, marginBottom: 10, alignItems: 'end' }}>
                  <label style={{ display: 'grid', gap: 5, color: palette.muted, fontSize: 11, fontWeight: 600 }}>Description<input aria-label={`Description article ${index + 1}`} required placeholder="Description" value={item.description} onChange={event => updateItem(index, 'description', event.target.value)} style={fieldStyle} /></label>
                  <label style={{ display: 'grid', gap: 5, color: palette.muted, fontSize: 11, fontWeight: 600 }}>Quantité<input aria-label={`Quantité article ${index + 1}`} type="number" min="0.01" step="any" required value={item.quantity} onChange={event => updateItem(index, 'quantity', event.target.value)} style={fieldStyle} /></label>
                  <label style={{ display: 'grid', gap: 5, color: palette.muted, fontSize: 11, fontWeight: 600, gridColumn: isMobile ? '1 / 3' : undefined }}>Prix unitaire<input aria-label={`Prix article ${index + 1}`} type="number" min="0" step="any" required value={item.unit_price} onChange={event => updateItem(index, 'unit_price', event.target.value)} style={fieldStyle} /></label>
                  <button type="button" aria-label="Supprimer la ligne" disabled={draft.items.length === 1} onClick={() => setDraft(current => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} style={{ border: `1px solid ${palette.dangerBorder}`, background: palette.dangerBg, borderRadius: 8, color: palette.dangerText, cursor: 'pointer', opacity: draft.items.length === 1 ? 0.55 : 1 }}>×</button>
                </div>
              ))}
              <button type="button" onClick={() => setDraft(current => ({ ...current, items: [...current.items, { description: '', quantity: '1', unit_price: '0' }] }))} style={{ border: 0, background: 'transparent', color: palette.accent, fontWeight: 700, padding: '8px 0', cursor: 'pointer' }}>+ Ajouter une ligne</button>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: palette.muted, marginTop: 12 }}>
                Date d’échéance (facultative)
                <input id="due-date" type="date" value={draft.due_date} onChange={event => setDraft(current => ({ ...current, due_date: event.target.value }))} style={{ ...fieldStyle, display: 'block', marginTop: 6 }} />
              </label>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: palette.muted, marginTop: 12 }}>
                Notes (facultatif)
                <textarea value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} rows={3} style={{ ...fieldStyle, display: 'block', marginTop: 6, resize: 'vertical' }} />
              </label>
            </div>
          </section>

          <aside style={{ background: palette.panel, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 16, padding: 24, position: 'sticky', top: 20, boxShadow: palette.cardShadow }}>
            <h2 style={{ fontSize: 15, margin: '0 0 20px' }}>Aperçu de la facture</h2>
            <div style={{ borderBottom: `1px solid ${palette.border}`, paddingBottom: 14, marginBottom: 12 }}>
              <p style={{ color: palette.accent, fontSize: 11, fontWeight: 800, margin: '0 0 8px' }}>FACTURE · NUMÉRO ATTRIBUÉ À L’ENREGISTREMENT</p>
              <p style={{ fontWeight: 700, margin: '0 0 4px' }}>{draft.client.name || 'Nom du client'}</p>
              <p style={{ color: palette.muted, fontSize: 12, margin: 0 }}>{draft.client.email || 'Coordonnées du client'}</p>
            </div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              {draft.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
                  <span style={{ color: palette.muted }}>{item.description || 'Article'} × {item.quantity === '' ? '—' : item.quantity}</span>
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMoney(lineTotal(item), draft.currency)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 12, display: 'grid', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: palette.muted }}><span>Sous-total</span><span>{formatMoney(subtotal, draft.currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: palette.muted }}><span>TVA</span><span>À définir</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 17, fontWeight: 800, marginTop: 4 }}><span>Total final</span><span>À confirmer</span></div>
            </div>
            <p style={{ color: palette.muted, fontSize: 11, lineHeight: 1.6, margin: '14px 0 18px' }}>Le taux de TVA de votre compte sera appliqué après connexion. Le montant affiché ici est un sous-total.</p>
            <button type="submit" disabled={isSubmitting} style={{ width: '100%', minHeight: 44, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#FFFFFF', border: 0, borderRadius: 10, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 14px -4px rgba(79,70,229,0.5)' }}>{isSubmitting ? 'Vérification…' : 'Continuer pour enregistrer'}</button>
            <p style={{ color: palette.muted, fontSize: 11, lineHeight: 1.5, textAlign: 'center', margin: '10px 0 0' }}>Un compte est nécessaire. Le PDF sera téléchargé après l’enregistrement.</p>
          </aside>
        </form>
      </div>
    </main>
  )
}
