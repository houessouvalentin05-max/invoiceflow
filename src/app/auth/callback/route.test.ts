import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const exchangeCodeForSessionMock = vi.fn()
const verifyOtpMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: exchangeCodeForSessionMock,
      verifyOtp: verifyOtpMock,
    },
  }),
}))

import { GET } from './route'

const BASE = 'http://localhost:3000/auth/callback'

function request(query = '') {
  return new NextRequest(`${BASE}${query}`)
}

describe('GET /auth/callback — confirmation email Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Le callback loggue le détail technique en console : on le muselle pour
    // garder une sortie de test lisible (le détail ne doit jamais atteindre l'UI).
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('échange le code PKCE contre une session puis redirige vers /dashboard', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ data: { session: {} }, error: null })

    const response = await GET(request('?code=auth-code-123'))

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith('auth-code-123')
    expect(verifyOtpMock).not.toHaveBeenCalled()
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('gère aussi le format token_hash + type (verifyOtp) et redirige vers /dashboard', async () => {
    verifyOtpMock.mockResolvedValue({ data: { session: {} }, error: null })

    const response = await GET(request('?token_hash=abc123&type=signup'))

    expect(verifyOtpMock).toHaveBeenCalledWith({ type: 'signup', token_hash: 'abc123' })
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('redirige vers l’écran d’erreur (lien expiré) quand Supabase refuse le lien', async () => {
    const response = await GET(
      request('?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')
    )

    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error?reason=expired')
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
  })

  it('ne fuit jamais le message technique quand l’échange de code échoue', async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      data: { session: null },
      error: new Error('PKCE code verifier not found in storage'),
    })

    const response = await GET(request('?code=code-perime'))
    const location = response.headers.get('location') ?? ''

    expect(location).toBe('http://localhost:3000/auth/error?reason=failed')
    expect(location).not.toContain('verifier')
    expect(console.error).toHaveBeenCalled()
  })

  it('redirige vers l’écran d’erreur quand la route est appelée sans paramètre exploitable', async () => {
    const response = await GET(request())

    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error?reason=missing')
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled()
    expect(verifyOtpMock).not.toHaveBeenCalled()
  })

  it('refuse un type OTP inconnu (pas de verifyOtp avec un type arbitraire)', async () => {
    const response = await GET(request('?token_hash=abc123&type=pas-un-type'))

    expect(verifyOtpMock).not.toHaveBeenCalled()
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error?reason=missing')
  })

  it('ne renvoie jamais 500 quand exchangeCodeForSession LANCE une exception (cookie verifier corrompu)', async () => {
    // Observé en réel contre le projet dev hébergé : un cookie code-verifier
    // malformé fait lever un TypeError dans supabase-js au lieu de renvoyer
    // { error }. Le callback doit alors rediriger, pas planter.
    exchangeCodeForSessionMock.mockRejectedValue(
      new TypeError("(intermediate value).split is not a function or its return value is not iterable")
    )

    const response = await GET(request('?code=code-valide-mais-verifier-pourri'))
    const location = response.headers.get('location') ?? ''

    expect(response.status).toBe(307)
    expect(location).toBe('http://localhost:3000/auth/error?reason=failed')
    expect(location).not.toContain('split')
    expect(console.error).toHaveBeenCalled()
  })

  it('ne renvoie jamais 500 quand verifyOtp LANCE une exception', async () => {
    verifyOtpMock.mockRejectedValue(new TypeError('network hiccup'))

    const response = await GET(request('?token_hash=abc123&type=signup'))
    const location = response.headers.get('location') ?? ''

    expect(response.status).toBe(307)
    expect(location).toBe('http://localhost:3000/auth/error?reason=failed')
    expect(console.error).toHaveBeenCalled()
  })

  it('utilise x-forwarded-host pour rediriger vers le domaine public hors dev', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    exchangeCodeForSessionMock.mockResolvedValue({ data: { session: {} }, error: null })

    try {
      const forwarded = new NextRequest('http://internal-host/auth/callback?code=auth-code-123', {
        headers: { 'x-forwarded-host': 'invoiceflow-jade.vercel.app' },
      })
      const response = await GET(forwarded)

      expect(response.headers.get('location')).toBe('https://invoiceflow-jade.vercel.app/dashboard')
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
