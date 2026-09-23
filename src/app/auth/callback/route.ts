import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Route de callback d'authentification (confirmation d'email).
 *
 * ── Format RÉEL du lien envoyé par Supabase ────────────────────────────────
 * Vérifié sur les projets hébergés (prod + dev) via `auth.admin.generateLink`
 * et la configuration Auth, et confirmé dans le code de GoTrue :
 *
 *   https://<ref>.supabase.co/auth/v1/verify
 *     ?token=pkce_<hash>&type=signup&redirect_to=<site>/auth/callback
 *
 * Deux points importants :
 *  1. Le token porte le préfixe `pkce_` car `@supabase/ssr` force
 *     `flowType: 'pkce'` (createBrowserClient) : le signUp envoie un
 *     `code_challenge`, GoTrue stocke un `flow_state` et préfixe le token.
 *  2. À la validation, GoTrue (verify.go → `prepPKCERedirectURL`) REDIRIGE
 *     vers `redirect_to?code=<auth_code>`. On échange donc ce `code` contre
 *     une session avec `exchangeCodeForSession` (pas `verifyOtp`).
 *
 * On gère malgré tout `token_hash` + `type` (verifyOtp) : c'est la forme
 * envoyée si le template email est un jour réécrit pour pointer directement
 * sur l'app (`{{ .SiteURL }}/auth/callback?token_hash=...&type=signup`).
 *
 * ── Cas d'erreur ──────────────────────────────────────────────────────────
 * Lien expiré / déjà utilisé → GoTrue redirige ici avec
 * `?error=access_denied&error_code=otp_expired&error_description=...`.
 * On ne réaffiche jamais ce message brut : on redirige vers /auth/error avec
 * un motif traduit, et on loggue le détail technique en console.
 */

const EMAIL_OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (EMAIL_OTP_TYPES as readonly string[]).includes(value)
}

/**
 * Base d'URL publique utilisée pour les redirections.
 * En production derrière un proxy (Vercel), `request.url` porte le host
 * interne : on privilégie `x-forwarded-host` pour retomber sur le domaine
 * public (invoiceflow-jade.vercel.app).
 */
function getRedirectBase(request: NextRequest): string {
  const { origin } = new URL(request.url)
  if (process.env.NODE_ENV === 'development') return origin

  const forwardedHost = request.headers.get('x-forwarded-host')
  return forwardedHost ? `https://${forwardedHost}` : origin
}

function redirectToError(request: NextRequest, reason: 'expired' | 'invalid' | 'missing' | 'failed', detail?: unknown) {
  const url = new URL('/auth/error', getRedirectBase(request))
  url.searchParams.set('reason', reason)
  if (detail) console.error('[auth/callback] échec de confirmation:', detail)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const errorCode = searchParams.get('error_code') ?? searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // 1. Supabase a déjà refusé le lien (expiré, déjà utilisé, mauvaise origine).
  if (errorCode || errorDescription) {
    return redirectToError(
      request,
      errorCode === 'otp_expired' || errorCode === 'access_denied' ? 'expired' : 'invalid',
      { errorCode, errorDescription }
    )
  }

  // 2. Aucun paramètre exploitable : lien tronqué ou page ouverte à la main.
  if (!code && !(tokenHash && isEmailOtpType(type))) {
    return redirectToError(request, 'missing')
  }

  const supabase = await createClient()

  // 3. Flux PKCE (cas réel : lien email par défaut) → échange du code.
  //    ⚠️ exchangeCodeForSession peut LANCER (et non renvoyer) une erreur quand
  //    le cookie code-verifier est absent, corrompu ou d'une forme inattendue
  //    (observé : TypeError `.split is not a function` sur un cookie douteux).
  //    On try/catch pour ne jamais répondre 500 depuis le callback.
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) return redirectToError(request, 'failed', error)
    } catch (error) {
      return redirectToError(request, 'failed', error)
    }

    return NextResponse.redirect(new URL('/dashboard', getRedirectBase(request)))
  }

  // 4. Flux token_hash (template email réécrit) → vérification de l'OTP.
  try {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash as string,
    })
    if (error) return redirectToError(request, 'failed', error)
  } catch (error) {
    return redirectToError(request, 'failed', error)
  }

  return NextResponse.redirect(new URL('/dashboard', getRedirectBase(request)))
}
