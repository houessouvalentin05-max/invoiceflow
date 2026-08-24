import { z } from 'zod'
import { NOTIFICATION_TYPES } from '../types'

export const createNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, { message: 'Type de notification invalide' }),
  reference: z.record(z.string(), z.unknown()).default({}),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>