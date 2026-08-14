import { z } from 'zod'

export const paymentSchema = z.object({
  invoice_id: z.string().uuid('Facture invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  method: z.enum(['momo', 'orange_money', 'bank_transfer', 'cash', 'other']).default('momo'),
  reference: z.string().optional(),
  paid_at: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>