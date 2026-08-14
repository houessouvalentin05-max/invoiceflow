import { invoiceSchema } from './invoice.validator'
import * as repo from './invoice.repository'
import { INVOICE_STATUSES, generateInvoiceNumber, tvaRate } from '@/lib/invoice-meta'

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
  return repo.updateInvoiceStatus(id, userId, status)
}

export async function removeInvoice(id: string, userId: string) {
  return repo.deleteInvoice(id, userId)
}