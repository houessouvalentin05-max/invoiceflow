import { profilePatchSchema } from './profile.validator'
import * as repo from './profile.repository'

export async function getCurrentProfile(userId: string) {
  return repo.getProfile(userId)
}

export async function saveProfile(userId: string, rawInput: unknown) {
  const input = profilePatchSchema.parse(rawInput)
  await repo.upsertProfile(userId, input)
  return { success: true }
}