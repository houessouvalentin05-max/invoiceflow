import { invoiceSchema } from './invoice.validator'
import * as repo from './invoice.repository'
import { ApiError } from '@/lib/api-error'
import { INVOICE_STATUSES, generateInvoiceNumber, tvaRate, type InvoiceStatus } from '@/lib/invoice-meta'

export const INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ['pending', 'sent'],
  pending: ['sent', 'viewed', 'overdue', 'paid'],
  sent: ['viewed', 'overdue', 'paid'],
  viewed: ['overdue', 'paid'],
  overdue: ['paid'],
  paid: [],
}

export async function listInvoices(userId: string) {
  return repo.getInvoices(userId)
}

export async function getInvoice(id: string, userId: string) {
  return repo.getInvoiceById(id, userId)
}

export async function addInvoice(userId: string, rawInput: unknown) {
  const input = invoiceSchema.parse(rawInput)

  // ⚠️ Recalcul des totaux CÔTÉ SERVEUR — jamais confiance au frontend
  const items = input.items.map(item => ({
    ...item,
    total: item.quantity * item.unit_price,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * tvaRate(await repo.getUserDefaultTva(userId))
  const total = subtotal + tax

  const invoice = await repo.createInvoiceDb(userId, {
    client_id: input.client_id,
    invoice_number: await generateUniqueInvoiceNumber(userId),
    currency: input.currency,
    due_date: input.due_date,
    status: input.status,
    notes: input.notes,
    subtotal,
    tax,
    total,
  })

  await repo.createInvoiceItems(invoice.id, items)

  return invoice
}

// N° de facture généré côté serveur, avec retry anti-collision (par utilisateur).
async function generateUniqueInvoiceNumber(userId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateInvoiceNumber()
    const exists = await repo.invoiceNumberExists(candidate, userId)
    if (!exists) return candidate
  }
  return `FAC-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`
}

export async function changeInvoiceStatus(id: string, userId: string, status: string) {
  if (!(INVOICE_STATUSES as readonly string[]).includes(status)) {
    throw new Error('Statut invalide')
  }

  const invoice = await repo.getInvoiceById(id, userId)
  const currentStatus = invoice.status as InvoiceStatus
  const nextStatus = status as InvoiceStatus

  if (currentStatus === nextStatus) return invoice

  if (!INVOICE_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new ApiError(409, `Transition de statut impossible : ${currentStatus} → ${nextStatus}.`)
  }

  const updated = await repo.updateInvoiceStatus(id, userId, nextStatus, currentStatus)
  if (!updated) {
    throw new ApiError(409, 'Le statut de la facture a changé. Rechargez la page avant de réessayer.')
  }

  return updated
}

export async function removeInvoice(id: string, userId: string) {
  const invoice = await repo.getInvoiceById(id, userId)
  if (invoice.status !== 'draft') {
    throw new ApiError(409, 'Seules les factures brouillon peuvent être supprimées.')
  }

  const deleted = await repo.deleteInvoice(id, userId)
  if (!deleted) {
    throw new ApiError(409, 'Le statut de la facture a changé. Rechargez la page avant de réessayer.')
  }
}