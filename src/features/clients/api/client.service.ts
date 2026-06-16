import { clientSchema } from './client.validator'
import * as repo from './client.repository'

export async function listClients(userId: string) {
  return repo.getClients(userId)
}

export async function addClient(userId: string, rawInput: unknown) {
  const input = clientSchema.parse(rawInput)
  return repo.createClientDb(userId, input)
}

export async function editClient(id: string, userId: string, rawInput: unknown) {
  const input = clientSchema.parse(rawInput)
  return repo.updateClient(id, userId, input)
}

export async function removeClient(id: string, userId: string) {
  return repo.deleteClient(id, userId)
}