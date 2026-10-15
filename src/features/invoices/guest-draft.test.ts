import { beforeEach, describe, expect, it } from 'vitest'
import {
  GUEST_INVOICE_DRAFT_KEY,
  GUEST_INVOICE_DRAFT_TTL_MS,
  loadGuestInvoiceDraft,
  storeGuestInvoiceDraft,
  type GuestInvoiceDraft,
} from './guest-draft'

const draft: GuestInvoiceDraft = {
  client: { name: 'Client Exemple', email: '' },
  currency: 'XOF',
  due_date: '',
  notes: '',
  items: [{ description: 'Conseil', quantity: 1, unit_price: 10000 }],
}

describe('guest invoice draft storage', () => {
  beforeEach(() => localStorage.clear())

  it('loads a valid draft within its retention window', () => {
    storeGuestInvoiceDraft(draft, 1_000)

    expect(loadGuestInvoiceDraft(1_000 + GUEST_INVOICE_DRAFT_TTL_MS - 1)).toEqual(draft)
  })

  it('removes an expired draft from local storage', () => {
    storeGuestInvoiceDraft(draft, 1_000)

    expect(loadGuestInvoiceDraft(1_000 + GUEST_INVOICE_DRAFT_TTL_MS + 1)).toBeNull()
    expect(localStorage.getItem(GUEST_INVOICE_DRAFT_KEY)).toBeNull()
  })
})