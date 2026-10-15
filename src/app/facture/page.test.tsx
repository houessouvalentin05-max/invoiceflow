import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const getUserMock = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))
vi.mock('@/lib/use-viewport', () => ({ useIsMobile: () => false }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getUser: getUserMock } }) }))

import GuestInvoicePage from './page'
import { GUEST_INVOICE_DRAFT_KEY, storeGuestInvoiceDraft } from '@/features/invoices/guest-draft'
import { GUEST_INVOICE_FINALIZE_PATH } from '@/lib/auth-redirect'

describe('GuestInvoicePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
    getUserMock.mockResolvedValue({ data: { user: null } })
  })

  it('saves the draft locally and asks the visitor to register before saving the PDF', async () => {
    const user = userEvent.setup()
    render(<GuestInvoicePage />)

    await user.type(screen.getByLabelText('Nom du client'), 'Client Exemple')
    await user.type(screen.getByLabelText('Description article 1'), 'Conseil')
    await user.clear(screen.getByLabelText('Prix article 1'))
    await user.type(screen.getByLabelText('Prix article 1'), '10000')
    expect(screen.getByText('À définir')).toBeInTheDocument()
    expect(screen.getByText('À confirmer')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuer pour enregistrer' }))

    expect(JSON.parse(localStorage.getItem(GUEST_INVOICE_DRAFT_KEY) ?? '{}').data).toMatchObject({
      client: { name: 'Client Exemple', email: '' },
      items: [{ description: 'Conseil', quantity: 1, unit_price: 10000 }],
    })
    expect(pushMock).toHaveBeenCalledWith(`/register?next=${encodeURIComponent(GUEST_INVOICE_FINALIZE_PATH)}`)
  })

  it('keeps the page palette in sync when the shared theme changes', async () => {
    render(<GuestInvoicePage />)
    const main = screen.getByRole('main')
    expect(main).toHaveStyle({ background: '#F8FAFC' })

    document.documentElement.dataset.theme = 'dark'

    await waitFor(() => expect(main).toHaveStyle({ background: '#080D1A' }))
    expect(screen.getByRole('button', { name: 'Supprimer la ligne' })).toHaveStyle({
      background: 'rgba(127, 29, 29, 0.24)',
    })

    document.documentElement.dataset.theme = 'light'
    await waitFor(() => expect(main).toHaveStyle({ background: '#F8FAFC' }))
  })

  it('honore data-theme posé avant le montage (aucun flash clair en mode sombre)', () => {
    document.documentElement.dataset.theme = 'dark'

    render(<GuestInvoicePage />)

    expect(screen.getByRole('main')).toHaveStyle({ background: '#080D1A' })
    expect(screen.getByLabelText('Nom du client')).toHaveStyle({
      background: '#0F172A',
      color: '#F8FAFC',
      'color-scheme': 'dark',
    })
  })

  it('shows an actionable error and focuses the first invalid field when the form is incomplete', async () => {
    const user = userEvent.setup()
    render(<GuestInvoicePage />)

    await user.click(screen.getByRole('button', { name: 'Continuer pour enregistrer' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Le nom du client est requis')
    await waitFor(() => expect(screen.getByLabelText('Nom du client')).toHaveFocus())
    expect(pushMock).not.toHaveBeenCalled()
    expect(localStorage.getItem(GUEST_INVOICE_DRAFT_KEY)).toBeNull()
  })

  it('names the exact line when a numeric field is left empty', async () => {
    const user = userEvent.setup()
    render(<GuestInvoicePage />)

    await user.type(screen.getByLabelText('Nom du client'), 'Client Exemple')
    await user.type(screen.getByLabelText('Description article 1'), 'Conseil')
    await user.clear(screen.getByLabelText('Prix article 1'))
    await user.click(screen.getByRole('button', { name: 'Continuer pour enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Prix unitaire requis pour l'article 1.")
    await waitFor(() => expect(screen.getByLabelText('Prix article 1')).toHaveFocus())
  })

  it('sends a signed-in visitor straight to the finalize step', async () => {
    const user = userEvent.setup()
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    render(<GuestInvoicePage />)

    await user.type(screen.getByLabelText('Nom du client'), 'Client Exemple')
    await user.type(screen.getByLabelText('Description article 1'), 'Conseil')
    await user.clear(screen.getByLabelText('Prix article 1'))
    await user.type(screen.getByLabelText('Prix article 1'), '10000')
    await user.click(screen.getByRole('button', { name: 'Continuer pour enregistrer' }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(GUEST_INVOICE_FINALIZE_PATH))
  })

  it('locks the submit button while the account is checked, then recovers from a network failure', async () => {
    const user = userEvent.setup()
    let resolveUser!: (value: unknown) => void
    getUserMock.mockReturnValue(new Promise(resolve => { resolveUser = resolve }))
    render(<GuestInvoicePage />)

    await user.type(screen.getByLabelText('Nom du client'), 'Client Exemple')
    await user.type(screen.getByLabelText('Description article 1'), 'Conseil')
    await user.clear(screen.getByLabelText('Prix article 1'))
    await user.type(screen.getByLabelText('Prix article 1'), '10000')
    const submit = screen.getByRole('button', { name: 'Continuer pour enregistrer' })
    await user.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
    expect(submit).toHaveTextContent('Vérification…')
    expect(pushMock).not.toHaveBeenCalled()

    resolveUser({ data: { user: null } })
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(`/register?next=${encodeURIComponent(GUEST_INVOICE_FINALIZE_PATH)}`))
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it('surfaces a friendly error instead of failing silently when the account check throws', async () => {
    const user = userEvent.setup()
    getUserMock.mockRejectedValue(new Error('network down'))
    render(<GuestInvoicePage />)

    await user.type(screen.getByLabelText('Nom du client'), 'Client Exemple')
    await user.type(screen.getByLabelText('Description article 1'), 'Conseil')
    await user.clear(screen.getByLabelText('Prix article 1'))
    await user.type(screen.getByLabelText('Prix article 1'), '10000')
    const submit = screen.getByRole('button', { name: 'Continuer pour enregistrer' })
    await user.click(submit)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Vérifiez votre connexion puis réessayez.')
    expect(pushMock).not.toHaveBeenCalled()
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it('restores a stored draft from the last 24 hours on mount', async () => {
    storeGuestInvoiceDraft({
      client: { name: 'Client Restauré', email: '' },
      currency: 'EUR',
      due_date: '',
      notes: '',
      items: [{ description: 'Conseil', quantity: 2, unit_price: 10000 }],
    })
    render(<GuestInvoicePage />)

    expect(await screen.findByLabelText('Nom du client')).toHaveValue('Client Restauré')
    expect(screen.getByLabelText('Description article 1')).toHaveValue('Conseil')
    // jest-dom convertit la valeur des inputs number en nombre.
    expect(screen.getByLabelText('Quantité article 1')).toHaveValue(2)
    expect(screen.getByLabelText('Prix article 1')).toHaveValue(10000)
    expect(await screen.findByRole('status')).toHaveTextContent('Brouillon restauré depuis ce navigateur.')
  })

  it('adds and removes line items while always keeping at least one line', async () => {
    const user = userEvent.setup()
    render(<GuestInvoicePage />)

    await user.click(screen.getByRole('button', { name: '+ Ajouter une ligne' }))
    expect(screen.getByLabelText('Description article 2')).toBeInTheDocument()

    let removeButtons = screen.getAllByRole('button', { name: 'Supprimer la ligne' })
    expect(removeButtons).toHaveLength(2)
    await user.click(removeButtons[1])
    expect(screen.queryByLabelText('Description article 2')).not.toBeInTheDocument()

    removeButtons = screen.getAllByRole('button', { name: 'Supprimer la ligne' })
    expect(removeButtons[0]).toBeDisabled()
  })
})
