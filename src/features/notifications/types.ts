export const NOTIFICATION_TYPES = [
  'payment_received',
  'invoice_paid',
  'invoice_overdue',
  'payment_reminder',
  'system',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationReference {
  invoiceId?: string
  paymentId?: string
  clientId?: string
  amount?: number
  invoiceNumber?: string
}

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  reference: NotificationReference
  read: boolean
  created_at: string
}