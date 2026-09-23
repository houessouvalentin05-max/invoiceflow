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

/** Remplit les 3 champs et soumet le formulaire d'inscription. */
async function submitRegisterForm(user: ReturnType<typeof userEvent.setup>, password = 'motdepasse1') {
  await user.type(screen.getByPlaceholderText('vous@example.com'), 'user@example.com')
  const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••')
  await user.type(pwd, password)
  await user.type(confirm, password)
  await user.click(screen.getByRole('button', { name: /s'inscrire/i }))
}

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

  it('redirige vers /dashboard quand Supabase renvoie déjà une session (autoconfirm)', async () => {
    signUpMock.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'user@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    })

    const user = userEvent.setup()
    render(<RegisterPage />)
    await submitRegisterForm(user)

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'))
    expect(screen.queryByText('Vérifiez votre boîte mail')).not.toBeInTheDocument()
  })

  it("affiche l'écran « Vérifiez votre boîte mail » quand aucune session n'est renvoyée, avec l'email saisi", async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@example.com' }, session: null },
      error: null,
    })

    const user = userEvent.setup()
    render(<RegisterPage />)
    await submitRegisterForm(user)

    expect(await screen.findByRole('heading', { name: 'Vérifiez votre boîte mail' })).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    // Le formulaire laisse la place à l'étape suivante, et surtout on ne
    // redirige PAS vers /dashboard : il n'y a pas encore de session.
    expect(screen.queryByPlaceholderText('vous@example.com')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /s'inscrire/i })).not.toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("fallback sur l'email soumis si la réponse signUp ne contient pas d'utilisateur", async () => {
    signUpMock.mockResolvedValue({ data: { user: null, session: null }, error: null })

    const user = userEvent.setup()
    render(<RegisterPage />)
    await submitRegisterForm(user)

    expect(await screen.findByRole('heading', { name: 'Vérifiez votre boîte mail' })).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('demande à Supabase de revenir sur /auth/callback pour le lien de confirmation', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@example.com' }, session: null },
      error: null,
    })

    const user = userEvent.setup()
    render(<RegisterPage />)
    await submitRegisterForm(user)

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'motdepasse1',
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
    )
  })
})