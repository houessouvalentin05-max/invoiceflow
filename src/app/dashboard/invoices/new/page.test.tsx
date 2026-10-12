import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, back: vi.fn() }) }))
vi.mock('@/lib/use-viewport', () => ({ useIsMobile: vi.fn(() => false) }))
vi.mock('@/app/dashboard/theme-context', () => ({
  useDashboardTheme: () => ({
    theme: 'light', toggleTheme: vi.fn(), setTheme: vi.fn(),
    sidebarCollapsed: false, toggleSidebar: vi.fn(),
  }),
}))

import NewInvoicePage from './page'

const fetchMock = vi.fn()

const json = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data })

const CLIENT = { id: 'c1', name: 'Client Exemple', created_at: '2026-01-15T10:00:00.000Z' }

describe('NewInvoicePage — parcours client → facture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('propose le lien « Créer un client » vers /dashboard/clients quand aucun client n’existe', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === '/api/clients' ? json([]) : json(null))

    render(<NewInvoicePage />)

    const link = await screen.findByRole('link', { name: 'Créer un client' })
    expect(link).toHaveAttribute('href', '/dashboard/clients')
  })

  it('sélectionne le client créé puis enregistre la facture pour ce client', async () => {
    fetchMock.mockImplementation(async (url: string, init?: { method?: string }) => {
      if (url === '/api/invoices' && init?.method === 'POST') return json({ id: 'inv1' }, true, 201)
      if (url === '/api/clients') return json([CLIENT])
      if (url === '/api/profile') return json({ default_tva: null })
      return json(null)
    })
    const user = userEvent.setup()
    render(<NewInvoicePage />)

    const option = await screen.findByRole('option', { name: 'Client Exemple' })
    const clientSelect = option.closest('select')!
    await user.selectOptions(clientSelect, 'c1')

    await user.type(screen.getByPlaceholderText("Description de l'article"), 'Conseil')
    const price = screen.getByPlaceholderText('0')
    await user.clear(price)
    await user.type(price, '10000')
    await user.click(screen.getByRole('button', { name: 'Créer la facture →' }))

    const postCall = fetchMock.mock.calls.find(
      ([url, init]) => url === '/api/invoices' && (init as RequestInit | undefined)?.method === 'POST',
    )
    expect(postCall).toBeTruthy()
    expect(JSON.parse((postCall![1] as RequestInit).body as string)).toMatchObject({
      client_id: 'c1',
      items: [{ description: 'Conseil', quantity: 1, unit_price: 10000 }],
    })
    expect(pushMock).toHaveBeenCalledWith('/dashboard/invoices')
  })
})
