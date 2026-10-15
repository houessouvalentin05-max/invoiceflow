'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_NEXT_PATH_KEY, safePostAuthPath } from '@/lib/auth-redirect'

export default function AuthContinuePage() {
  const router = useRouter()

  useEffect(() => {
    const next = safePostAuthPath(localStorage.getItem(AUTH_NEXT_PATH_KEY))
    localStorage.removeItem(AUTH_NEXT_PATH_KEY)
    router.replace(next)
  }, [router])

  return <main role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#52616B' }}>Connexion confirmée, redirection…</main>
}