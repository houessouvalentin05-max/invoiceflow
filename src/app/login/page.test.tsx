import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const signInWithPasswordMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  }),
}))

import LoginPage from './page'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre et le formulaire', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Se connecter' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('affiche les erreurs de validation (email invalide + mot de passe trop court)', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'pas-un-email')
    await user.type(screen.getByPlaceholderText('••••••••'), '123')

    await user.click(screen.getByRole('button', { name: /Se connecter/ }))

    expect(await screen.findByText('Email invalide')).toBeInTheDocument()
    expect(await screen.findByText('Minimum 6 caractères')).toBeInTheDocument()
    expect(signInWithPasswordMock).not.toHaveBeenCalled()
  })

  it("affiche un message d'erreur quand les identifiants sont incorrects", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: new Error('Invalid login credentials') })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'motdepasse1')
    await user.click(screen.getByRole('button', { name: /Se connecter/ }))

    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('redirige vers /dashboard après connexion réussie', async () => {
    signInWithPasswordMock.mockResolvedValue({ data: { session: {} }, error: null })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'motdepasse1')
    await user.click(screen.getByRole('button', { name: /Se connecter/ }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'))
  })
})