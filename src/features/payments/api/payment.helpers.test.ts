import { describe, it, expect } from 'vitest'
import { shouldMarkInvoiceAsPaid } from './payment.helpers'

describe('shouldMarkInvoiceAsPaid', () => {
  it('marque la facture comme payée quand le total payé couvre le total', () => {
    expect(shouldMarkInvoiceAsPaid(100, 100)).toBe(true)
  })

  it('marque la facture comme payée quand le total payé dépasse le total (trop-payé)', () => {
    expect(shouldMarkInvoiceAsPaid(150, 100)).toBe(true)
  })

  it('ne marque PAS la facture comme payée quand le montant est insuffisant', () => {
    expect(shouldMarkInvoiceAsPaid(99.99, 100)).toBe(false)
  })

  it('ne marque PAS la facture comme payée quand aucun paiement n’existe', () => {
    expect(shouldMarkInvoiceAsPaid(0, 100)).toBe(false)
  })

  it('gère les montants décimaux (précision flottante)', () => {
    expect(shouldMarkInvoiceAsPaid(49.99 + 49.99, 99.98)).toBe(true)
  })

  it('retourne false pour une facture à total négatif ou nul', () => {
    expect(shouldMarkInvoiceAsPaid(0, 0)).toBe(false)
    expect(shouldMarkInvoiceAsPaid(10, -5)).toBe(false)
  })

  it('retourne false si une valeur est non finie', () => {
    expect(shouldMarkInvoiceAsPaid(Number.NaN, 100)).toBe(false)
    expect(shouldMarkInvoiceAsPaid(100, Number.POSITIVE_INFINITY)).toBe(false)
  })
})