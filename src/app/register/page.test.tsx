import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
const signUpMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signUp: signUpMock },
  }),
}))

import RegisterPage from './page'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre et les trois champs (email, mot de passe, confirmation)', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('vous@example.com')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2)
  })

  it('affiche les erreurs de validation (email invalide + mot de passe trop court) sans appeler signUp', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'pas-un-email')
    const [password] = screen.getAllByPlaceholderText('••••••••')
    await user.type(password, '123')

    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText('Email invalide')).toBeInTheDocument()
    expect(await screen.findByText('Minimum 6 caractères')).toBeInTheDocument()
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it("affiche une erreur quand les mots de passe ne correspondent pas", async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
    const [password, confirm] = screen.getAllByPlaceholderText('••••••••')
    await user.type(password, 'motdepasse1')
    await user.type(confirm, 'motdepasse-different')

    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText('Les mots de passe ne correspondent pas')).toBeInTheDocument()
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it("affiche un message d'erreur quand l'inscription échoue", async () => {
    signUpMock.mockResolvedValue({ error: new Error('User already registered') })

    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
    const [password, confirm] = screen.getAllByPlaceholderText('••••••••')
    await user.type(password, 'motdepasse1')
    await user.type(confirm, 'motdepasse1')

    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText('User already registered')).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("redirige vers /dashboard après inscription réussie", async () => {
    signUpMock.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
    const [password, confirm] = screen.getAllByPlaceholderText('••••••••')
    await user.type(password, 'motdepasse1')
    await user.type(confirm, 'motdepasse1')

    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'))
  })
})