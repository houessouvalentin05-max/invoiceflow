import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const replaceMock = vi.fn()
const getUserMock = vi.fn()
const pdfMock = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getUser: getUserMock } }) }))
vi.mock('@/features/invoices/components/InvoicePDF', () => ({ InvoicePDF: () => null }))
vi.mock('@react-pdf/renderer', () => ({ pdf: (...args: unknown[]) => pdfMock(...args) }))

import FinalizeGuestInvoicePage from './page'
import {
  GUEST_CLIENT_ID_KEY,
  GUEST_INVOICE_DRAFT_KEY,
  GUEST_INVOICE_ID_KEY,
  storeGuestInvoiceDraft,
} from '@/features/invoices/guest-draft'

describe('FinalizeGuestInvoicePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    pdfMock.mockReturnValue({ toBlob: vi.fn().mockResolvedValue(new Blob(['pdf'])) })
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('persists the invoice through authenticated APIs, downloads its PDF, then clears the draft', async () => {
    storeGuestInvoiceDraft({
      client: { name: 'Client Exemple', email: '' },
      currency: 'XOF',
      due_date: '',
      notes: '',
      items: [{ description: 'Conseil', quantity: 1, unit_price: 10000 }],
    })

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ id: 'client-1' }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ id: 'invoice-1' }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({
        id: 'invoice-1',
        invoice_number: 'FAC-2026-123456',
        currency: 'XOF',
        subtotal: 10000,
        tax: 1800,
        total: 11800,
        due_date: null,
        created_at: '2026-10-07T12:00:00.000Z',
        client: { name: 'Client Exemple' },
        items: [{ description: 'Conseil', quantity: 1, unit_price: 10000, total: 10000 }],
      }))
    vi.stubGlobal('fetch', fetchMock)

    render(<FinalizeGuestInvoicePage />)

    expect(await screen.findByText('Votre facture est enregistrée et le téléchargement du PDF a démarré.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/clients', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/invoices', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/invoices/invoice-1')
    expect(pdfMock).toHaveBeenCalledOnce()
    expect(await screen.findByRole('link', { name: 'Ouvrir la facture enregistrée' })).toHaveAttribute('href', '/dashboard/invoices/invoice-1')
    expect(localStorage.getItem(GUEST_INVOICE_DRAFT_KEY)).toBeNull()
    expect(localStorage.getItem(GUEST_CLIENT_ID_KEY)).toBeNull()
    expect(localStorage.getItem(GUEST_INVOICE_ID_KEY)).toBeNull()
  })

  it('sends a visitor without a session to login with the finalization destination', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })

    render(<FinalizeGuestInvoicePage />)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login?next=%2Ffactures%2Ffinaliser'))
    expect(fetch).not.toHaveBeenCalled()
  })
})