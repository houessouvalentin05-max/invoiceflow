import { invoiceSchema } from './invoice.validator'
import * as repo from './invoice.repository'

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
  const tax = subtotal * 0.18 // TVA Togo 18%
  const total = subtotal + tax

  const invoice = await repo.createInvoiceDb(userId, {
    client_id: input.client_id,
    invoice_number: input.invoice_number,
    currency: input.currency,
    due_date: input.due_date,
    subtotal,
    tax,
    total,
  })

  await repo.createInvoiceItems(invoice.id, items)

  return invoice
}

export async function changeInvoiceStatus(id: string, userId: string, status: string) {
  const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'overdue']
  if (!validStatuses.includes(status)) {
    throw new Error('Statut invalide')
  }
  return repo.updateInvoiceStatus(id, userId, status)
}

export async function removeInvoice(id: string, userId: string) {
  return repo.deleteInvoice(id, userId)
}