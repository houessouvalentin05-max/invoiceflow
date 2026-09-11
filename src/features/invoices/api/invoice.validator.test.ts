import { describe, it, expect } from 'vitest'
import { invoiceSchema } from './invoice.validator'

const VALID = {
  client_id: '11111111-1111-4111-8111-111111111111',
  currency: 'XOF',
  items: [{ description: 'Prestation', quantity: 1, unit_price: 10000 }],
}

describe('invoice.validator — cas limites', () => {
  it('accepte une facture minimale valide (statut par défaut draft)', () => {
    const parsed = invoiceSchema.parse(VALID)
    expect(parsed.status).toBe('draft')
    expect(parsed.currency).toBe('XOF')
  })

  it('rejette un client_id non UUID', () => {
    expect(() => invoiceSchema.parse({ ...VALID, client_id: 'abc' })).toThrow('Client invalide')
  })

  it('rejette une liste d’articles vide', () => {
    expect(() => invoiceSchema.parse({ ...VALID, items: [] })).toThrow('Au moins un article requis')
  })

  it('rejette une quantité négative ou nulle', () => {
    expect(() => invoiceSchema.parse({ ...VALID, items: [{ description: 'x', quantity: 0, unit_price: 10 }] }))
      .toThrow('Quantité doit être positive')
  })

  it('rejette un prix négatif', () => {
    expect(() => invoiceSchema.parse({ ...VALID, items: [{ description: 'x', quantity: 1, unit_price: -5 }] }))
      .toThrow('Prix ne peut pas être négatif')
  })

  it('rejette une description vide', () => {
    expect(() => invoiceSchema.parse({ ...VALID, items: [{ description: '', quantity: 1, unit_price: 10 }] }))
      .toThrow('Description requise')
  })

  it('rejette un statut hors enum', () => {
    expect(() => invoiceSchema.parse({ ...VALID, status: 'archived' })).toThrow()
  })
})