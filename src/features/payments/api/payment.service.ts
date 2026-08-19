import { paymentSchema } from './payment.validator'
import { shouldMarkInvoiceAsPaid } from './payment.helpers'
import * as repo from './payment.repository'

export async function listPayments(userId: string) {
  return repo.getPayments(userId)
}

export async function addPayment(userId: string, rawInput: unknown) {
  const input = paymentSchema.parse(rawInput)

  const paidAt = input.paid_at || new Date().toISOString().split('T')[0]
  const payment = await repo.createPaymentDb(userId, { ...input, paid_at: paidAt })

  // Logique « facture entièrement payée » calculée CÔTÉ SERVEUR (jamais du client)
  const invoiceTotal = await repo.getInvoiceTotal(input.invoice_id, userId)
  if (invoiceTotal != null) {
    const totalPaid = await repo.sumInvoicePayments(input.invoice_id, userId)
    if (shouldMarkInvoiceAsPaid(totalPaid, Number(invoiceTotal))) {
      await repo.markInvoicePaid(input.invoice_id, userId, paidAt)
    }
  }

  return payment
}

export async function removePayment(id: string, userId: string) {
  return repo.deletePayment(id, userId)
}