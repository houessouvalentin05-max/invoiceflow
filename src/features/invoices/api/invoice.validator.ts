import { z } from 'zod'

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().positive('Quantité doit être positive'),
  unit_price: z.number().nonnegative('Prix ne peut pas être négatif'),
})

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Client invalide'),
  invoice_number: z.string().min(1, 'Numéro de facture requis'),
  currency: z.enum(['XOF', 'EUR', 'USD']),
  due_date: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article requis'),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>