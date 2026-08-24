import { createNotificationSchema } from './notification.validator'
import * as repo from './notification.repository'

export async function listNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    repo.listNotifications(userId),
    repo.countUnreadNotifications(userId),
  ])
  return { notifications, unreadCount }
}

export async function createNotification(userId: string, rawInput: unknown) {
  const input = createNotificationSchema.parse(rawInput)
  return repo.createNotificationDb(userId, input)
}

export async function markNotificationRead(id: string, userId: string) {
  await repo.markNotificationRead(id, userId)
}