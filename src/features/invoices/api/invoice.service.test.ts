import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./invoice.repository', () => ({
  getInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
  createInvoiceDb: vi.fn(),
  createInvoiceItems: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  deleteInvoice: vi.fn(),
  getUserDefaultTva: vi.fn(),
  invoiceNumberExists: vi.fn(),
}))

import * as repo from './invoice.repository'
import { addInvoice, changeInvoiceStatus, listInvoices, getInvoice, removeInvoice } from './invoice.service'

const repoMock = repo as unknown as {
  getInvoices: ReturnType<typeof vi.fn>
  getInvoiceById: ReturnType<typeof vi.fn>
  createInvoiceDb: ReturnType<typeof vi.fn>
  createInvoiceItems: ReturnType<typeof vi.fn>
  updateInvoiceStatus: ReturnType<typeof vi.fn>
  deleteInvoice: ReturnType<typeof vi.fn>
  getUserDefaultTva: ReturnType<typeof vi.fn>
  invoiceNumberExists: ReturnType<typeof vi.fn>
}

const VALID_PAYLOAD = {
  client_id: '11111111-1111-4111-8111-111111111111',
  currency: 'XOF',
  due_date: '2026-09-30',
  status: 'draft',
  items: [
    { description: 'Prestation', quantity: 2, unit_price: 50000 },
    { description: 'Forfait', quantity: 1, unit_price: 75000 },
  ],
}

describe('invoice.service — calculs serveur & garde-fous', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repoMock.createInvoiceDb.mockResolvedValue({ id: 'inv-1', ...VALID_PAYLOAD })
    repoMock.createInvoiceItems.mockResolvedValue(undefined)
    repoMock.invoiceNumberExists.mockResolvedValue(false)
    repoMock.getUserDefaultTva.mockResolvedValue('18') // 18 % → 0.18
  })

  it('recalcule subtotal, tax (18%) et total CÔTÉ SERVEUR', async () => {
    await addInvoice('user-1', VALID_PAYLOAD)

    expect(repoMock.createInvoiceDb).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        subtotal: 175000, // 2×50000 + 1×75000
        tax: 31500,       // 175000 × 0.18
        total: 206500,
        currency: 'XOF',
        status: 'draft',
      })
    )
    expect(repoMock.createInvoiceItems).toHaveBeenCalledWith(
      'inv-1',
      expect.arrayContaining([
        expect.objectContaining({ description: 'Prestation', quantity: 2, unit_price: 50000, total: 100000 }),
        expect.objectContaining({ description: 'Forfait', quantity: 1, unit_price: 75000, total: 75000 }),
      ])
    )
  })

  it('utilise le taux TVA du profil (default_tva) au lieu d’un hardcode', async () => {
    repoMock.getUserDefaultTva.mockResolvedValue('10') // TVA à 10 %

    await addInvoice('user-1', VALID_PAYLOAD)

    expect(repoMock.createInvoiceDb).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ subtotal: 175000, tax: 17500, total: 192500 })
    )
  })

  it('rejette un payload invalide (Zod) sans jamais toucher au repo', async () => {
    await expect(addInvoice('user-1', { client_id: 'pas-un-uuid', items: [] })).rejects.toThrow()
    expect(repoMock.createInvoiceDb).not.toHaveBeenCalled()
    expect(repoMock.createInvoiceItems).not.toHaveBeenCalled()
  })

  it('changeInvoiceStatus rejette un statut hors enum', async () => {
    await expect(changeInvoiceStatus('inv-1', 'user-1', 'invalide')).rejects.toThrow('Statut invalide')
    expect(repoMock.updateInvoiceStatus).not.toHaveBeenCalled()
  })

  it('changeInvoiceStatus accepte un statut valide et filtre par user_id', async () => {
    repoMock.updateInvoiceStatus.mockResolvedValue({ id: 'inv-1', status: 'paid' })

    await changeInvoiceStatus('inv-1', 'user-1', 'paid')

    expect(repoMock.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', 'user-1', 'paid')
  })

  it('délègue list/get/remove avec la user_id (isolation)', async () => {
    repoMock.getInvoices.mockResolvedValue([{ id: 'a' }])
    repoMock.getInvoiceById.mockResolvedValue({ id: 'b' })
    repoMock.deleteInvoice.mockResolvedValue(undefined)

    await listInvoices('user-1')
    await getInvoice('inv-x', 'user-1')
    await removeInvoice('inv-y', 'user-1')

    expect(repoMock.getInvoices).toHaveBeenCalledWith('user-1')
    expect(repoMock.getInvoiceById).toHaveBeenCalledWith('inv-x', 'user-1')
    expect(repoMock.deleteInvoice).toHaveBeenCalledWith('inv-y', 'user-1')
  })
})