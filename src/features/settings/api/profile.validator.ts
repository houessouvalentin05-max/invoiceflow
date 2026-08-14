import { z } from 'zod'

export const profilePatchSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  tax_number: z.string().optional(),
  website: z.string().optional(),
  default_currency: z.string().optional(),
  default_tva: z.string().optional(),
  invoice_prefix: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  auto_payment_reminder_7d: z.boolean().optional(),
  auto_payment_reminder_30d: z.boolean().optional(),
  auto_thank_you_email: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
})

export type ProfilePatchInput = z.infer<typeof profilePatchSchema>