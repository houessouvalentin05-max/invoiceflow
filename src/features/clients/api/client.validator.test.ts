import { describe, it, expect } from 'vitest'
import { clientSchema } from './client.validator'

describe('client.validator — cas limites', () => {
  it('accepte un client valide (avec email optionnel)', () => {
    const parsed = clientSchema.parse({ name: 'Acme SARL', email: 'a@b.co', phone: '+228 90 00 00 00' })
    expect(parsed.name).toBe('Acme SARL')
  })

  it('accepte un nom seul et un email vide', () => {
    const parsed = clientSchema.parse({ name: 'Paul', email: '' })
    expect(parsed.email).toBe('')
  })

  it('rejette un nom vide', () => {
    expect(() => clientSchema.parse({ name: '' })).toThrow('Le nom est requis')
  })

  it('rejette un email mal formé', () => {
    expect(() => clientSchema.parse({ name: 'Jean', email: 'pas-un-email' })).toThrow('Email invalide')
  })
})