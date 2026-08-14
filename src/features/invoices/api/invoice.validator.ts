import { z } from 'zod'
import { INVOICE_STATUSES } from '@/lib/invoice-meta'

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().positive('Quantité doit être positive'),
  unit_price: z.number().nonnegative('Prix ne peut pas être négatif'),
})

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Client invalide'),
  // Optionnel : le n° est généré côté serveur (addInvoice) et la valeur client est ignorée.
  invoice_number: z.string().min(1, 'Numéro de facture requis').optional(),
  currency: z.enum(['XOF', 'EUR', 'USD']),
  due_date: z.string().optional(),
  status: z.enum(INVOICE_STATUSES).optional().default('draft'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article requis'),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>