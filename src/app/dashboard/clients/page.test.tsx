import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }))
vi.mock('@/lib/use-viewport', () => ({ useIsMobile: vi.fn(() => false) }))
vi.mock('@/app/dashboard/theme-context', () => ({
  useDashboardTheme: () => ({
    theme: 'light', toggleTheme: vi.fn(), setTheme: vi.fn(),
    sidebarCollapsed: false, toggleSidebar: vi.fn(),
  }),
}))

import ClientsPage from './page'
import { useIsMobile } from '@/lib/use-viewport'

const fetchMock = vi.fn()

const json = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data })

const NEW_CLIENT = {
  id: 'c1', name: 'Client Exemple', email: 'client@example.com',
  phone: null, company: null, address: null, created_at: '2026-01-15T10:00:00.000Z',
}

describe('ClientsPage — CTA de l’état vide (bouton « + Créer votre premier client »)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useIsMobile).mockReturnValue(false)
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ouvre le formulaire « Nouveau client » quand on clique sur le CTA en compte vide', async () => {
    fetchMock.mockResolvedValue(json([]))
    const user = userEvent.setup()
    render(<ClientsPage />)

    const cta = await screen.findByRole('button', { name: '+ Créer votre premier client' })
    await user.click(cta)

    // Régression du bug : le clic basculait showForm sans jamais afficher le formulaire.
    expect(await screen.findByRole('heading', { name: 'Nouveau client' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('crée un client depuis l’état vide puis l’affiche dans la liste', async () => {
    let getCalls = 0
    fetchMock.mockImplementation(async (url: string, init?: { method?: string }) => {
      if (url === '/api/clients' && init?.method === 'POST') return json(NEW_CLIENT, true, 201)
      if (url === '/api/clients') {
        getCalls += 1
        return json(getCalls === 1 ? [] : [NEW_CLIENT])
      }
      return json(null)
    })
    const user = userEvent.setup()
    render(<ClientsPage />)

    await user.click(await screen.findByRole('button', { name: '+ Créer votre premier client' }))
    await user.type(screen.getByPlaceholderText('Jean Dupont'), 'Client Exemple')
    await user.click(screen.getByRole('button', { name: 'Enregistrer le client' }))

    const postCall = fetchMock.mock.calls.find(
      ([url, init]) => url === '/api/clients' && (init as RequestInit | undefined)?.method === 'POST',
    )
    expect(postCall).toBeTruthy()
    expect(JSON.parse((postCall![1] as RequestInit).body as string)).toMatchObject({ name: 'Client Exemple' })

    // Le rechargement retourne le client créé → la carte apparaît, le formulaire se referme.
    expect(await screen.findByText('Client Exemple')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Nouveau client' })).not.toBeInTheDocument(),
    )
  })

  it('ouvre aussi le formulaire en viewport mobile, en colonne unique', async () => {
    vi.mocked(useIsMobile).mockReturnValue(true)
    fetchMock.mockResolvedValue(json([]))
    const user = userEvent.setup()
    render(<ClientsPage />)

    await user.click(await screen.findByRole('button', { name: '+ Créer votre premier client' }))

    const form = await screen.findByRole('heading', { name: 'Nouveau client' })
    const formEl = form.closest('div')!.querySelector('form')!
    expect(formEl.firstElementChild).toHaveStyle({ gridTemplateColumns: '1fr' })
  })
})
