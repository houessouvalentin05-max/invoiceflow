import { z } from 'zod'

export const GUEST_INVOICE_DRAFT_KEY = 'invoiceflow-guest-invoice'
export const GUEST_INVOICE_ID_KEY = 'invoiceflow-guest-invoice-id'
export const GUEST_CLIENT_ID_KEY = 'invoiceflow-guest-client'
export const GUEST_INVOICE_DRAFT_TTL_MS = 24 * 60 * 60 * 1000

export const guestInvoiceDraftSchema = z.object({
  client: z.object({
    name: z.string().trim().min(1, 'Le nom du client est requis'),
    email: z.string().email('Email invalide').or(z.literal('')),
  }),
  currency: z.enum(['XOF', 'EUR', 'USD']),
  // Une date passée reste autorisée (saisie d'une facture déjà en retard),
  // mais on refuse tout texte non interprétable comme une date.
  due_date: z.string().refine(value => value === '' || !Number.isNaN(Date.parse(value)), "Date d'échéance invalide"),
  notes: z.string(),
  items: z.array(z.object({
    description: z.string().trim().min(1, 'Description requise'),
    quantity: z.number().positive('La quantité doit être positive'),
    unit_price: z.number().nonnegative('Le prix ne peut pas être négatif'),
  })).min(1, 'Ajoutez au moins un article'),
})

export type GuestInvoiceDraft = z.infer<typeof guestInvoiceDraftSchema>

/**
 * Persiste le brouillon. Retourne `false` si le navigateur refuse l'écriture
 * (quota dépassé, mode privé…) pour que l'appelant puisse afficher une erreur.
 */
export function storeGuestInvoiceDraft(draft: GuestInvoiceDraft, now = Date.now()): boolean {
  try {
    localStorage.setItem(GUEST_INVOICE_DRAFT_KEY, JSON.stringify({ savedAt: now, data: draft }))
    return true
  } catch {
    return false
  }
}

export function loadGuestInvoiceDraft(now = Date.now()): GuestInvoiceDraft | null {
  try {
    const value = localStorage.getItem(GUEST_INVOICE_DRAFT_KEY)
    if (!value) return null

    const stored = JSON.parse(value) as { savedAt?: number; data?: unknown }
    if (typeof stored.savedAt !== 'number' || now - stored.savedAt > GUEST_INVOICE_DRAFT_TTL_MS) {
      localStorage.removeItem(GUEST_INVOICE_DRAFT_KEY)
      return null
    }

    const parsed = guestInvoiceDraftSchema.safeParse(stored.data)
    if (!parsed.success) {
      localStorage.removeItem(GUEST_INVOICE_DRAFT_KEY)
      return null
    }

    return parsed.data
  } catch {
    localStorage.removeItem(GUEST_INVOICE_DRAFT_KEY)
    return null
  }
}