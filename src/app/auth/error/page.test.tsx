import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import AuthErrorPage from './page'

function renderPage(reason?: string) {
  return AuthErrorPage({ searchParams: Promise.resolve(reason ? { reason } : {}) })
}

describe('/auth/error — écran d’erreur de confirmation', () => {
  it('affiche un message clair (sans détail technique) et une action pour un lien expiré', async () => {
    render(await renderPage('expired'))

    expect(screen.getByRole('heading', { name: 'Ce lien de confirmation a expiré' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Recommencer l’inscription/ })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /J’ai déjà confirmé/ })).toHaveAttribute('href', '/login')
  })

  it.each(['invalid', 'missing', 'failed'])('affiche un titre dédié pour le motif « %s »', async (reason) => {
    render(await renderPage(reason))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading')).not.toHaveTextContent('Ce lien de confirmation a expiré')
  })

  it('retombe sur le motif « failed » quand le paramètre est absent ou inconnu', async () => {
    render(await renderPage())
    expect(screen.getByRole('heading', { name: 'Confirmation impossible' })).toBeInTheDocument()
  })
})
