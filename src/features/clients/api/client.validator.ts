import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>