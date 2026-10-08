import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getInvoice: vi.fn(),
  changeInvoiceStatus: vi.fn(),
  removeInvoice: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}))

vi.mock('@/features/invoices/api/invoice.service', () => ({
  getInvoice: mocks.getInvoice,
  changeInvoiceStatus: mocks.changeInvoiceStatus,
  removeInvoice: mocks.removeInvoice,
}))

import { DELETE, PATCH } from './route'
import { ApiError } from '@/lib/api-error'

const params = Promise.resolve({ id: 'inv-1' })

describe('/api/invoices/[id] mutability conflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns HTTP 409 when deletion is rejected by the status guard', async () => {
    mocks.removeInvoice.mockRejectedValue(new ApiError(409, 'Seules les factures brouillon peuvent être supprimées.'))

    const response = await DELETE(new NextRequest('http://localhost/api/invoices/inv-1'), { params })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ error: 'Seules les factures brouillon peuvent être supprimées.' })
  })

  it('returns HTTP 409 when a status transition is not allowed', async () => {
    mocks.changeInvoiceStatus.mockRejectedValue(new ApiError(409, 'Transition de statut impossible.'))

    const response = await PATCH(new NextRequest('http://localhost/api/invoices/inv-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    }), { params })

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ error: 'Transition de statut impossible.' })
  })
})