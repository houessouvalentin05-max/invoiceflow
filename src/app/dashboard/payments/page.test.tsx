import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/use-viewport', () => ({ useIsMobile: vi.fn(() => false) }))
vi.mock('@/app/dashboard/theme-context', () => ({
  useDashboardTheme: () => ({
    theme: 'light', toggleTheme: vi.fn(), setTheme: vi.fn(),
    sidebarCollapsed: false, toggleSidebar: vi.fn(),
  }),
}))

import PaymentsPage from './page'

const fetchMock = vi.fn()

const json = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data })

const PAYMENT = {
  id: 'p1', amount: 25000, method: 'momo', reference: 'TX-1', paid_at: '2026-01-10',
  invoice: { invoice_number: 'INV-000', client: { name: 'Client Exemple' } },
}
const UNPAID_INVOICE = {
  id: 'inv1', invoice_number: 'INV-001', status: 'pending', total: 50000,
  client: { name: 'Client Exemple' },
}

describe('PaymentsPage — formulaire de paiement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/payments') return json([PAYMENT])
      if (url === '/api/invoices') return json([UNPAID_INVOICE])
      return json(null)
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche le formulaire au-dessus des statistiques, dans la zone visible (fix mobile)', async () => {
    const user = userEvent.setup()
    const { container } = render(<PaymentsPage />)

    await user.click(await screen.findByRole('button', { name: '+ Enregistrer un paiement' }))

    const heading = await screen.findByRole('heading', { name: 'Enregistrer un paiement' })
    const statsLabel = await screen.findByText('Total encaissé')
    // Le formulaire précède les cartes stats : sur mobile il apparaît dans le viewport.
    expect(heading.compareDocumentPosition(statsLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // La facture impayée est sélectionnable dans le formulaire.
    expect(screen.getByRole('option', { name: /INV-001/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enregistrer le paiement' })).toBeInTheDocument()

    // La large table des paiements reste dans son conteneur scrollable.
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(table!.parentElement).toHaveStyle({ overflowX: 'auto' })
  })
})
