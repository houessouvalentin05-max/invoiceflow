import Link from 'next/link'

/**
 * Page d'erreur du flow de confirmation d'email.
 *
 * Le callback d'auth ne réaffiche jamais le message brut de Supabase
 * (`error_description`, `error.message`) à l'écran : il redirige ici avec un
 * motif traduit (`?reason=expired|invalid|missing|failed`). Le détail
 * technique reste dans les logs serveur (console.error dans le callback).
 */
export const dynamic = 'force-dynamic'

type ErrorReason = 'expired' | 'invalid' | 'missing' | 'failed'

const COPY: Record<ErrorReason, { title: string; message: string; hint: string }> = {
  expired: {
    title: 'Ce lien de confirmation a expiré',
    message:
      "Les liens de confirmation ne sont valables qu'un temps limité, et ils ne peuvent servir qu'une seule fois. Le vôtre a déjà été utilisé ou n'est plus actif.",
    hint: 'Relancez l’inscription pour recevoir un nouveau lien, puis ouvrez-le dans les minutes qui suivent.',
  },
  invalid: {
    title: 'Lien de confirmation invalide',
    message:
      "Le lien reçu ne correspond à aucune demande en cours. Cela arrive quand le lien a été tronqué par la messagerie ou copié partiellement.",
    hint: 'Ouvrez directement le bouton « Confirmer mon adresse email » depuis l’email reçu.',
  },
  missing: {
    title: 'Aucun lien de confirmation détecté',
    message:
      "Cette page doit être ouverte depuis le lien reçu par email : il manque les informations de vérification.",
    hint: 'Ouvrez le lien de confirmation reçu par email, ou relancez l’inscription.',
  },
  failed: {
    title: 'Confirmation impossible',
    message:
      "Nous n'avons pas pu valider votre adresse email. Le lien est peut-être incomplet, ou la session a expiré avant la validation.",
    hint: 'Relancez l’inscription pour obtenir un nouveau lien de confirmation.',
  },
}

function getReason(value: string | string[] | undefined): ErrorReason {
  const reason = Array.isArray(value) ? value[0] : value
  if (reason === 'expired' || reason === 'invalid' || reason === 'missing' || reason === 'failed') {
    return reason
  }
  return 'failed'
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string | string[] }>
}) {
  const { reason } = await searchParams
  const copy = COPY[getReason(reason)]

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Inter,system-ui,sans-serif', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '40px 36px', boxShadow: '0 20px 45px -30px rgba(15,23,42,0.35)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <path d="M6 5v14" /><path d="M11 19V5h7" /><path d="M11 12h5" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', letterSpacing: '-0.3px' }}>
            Invoice<span style={{ color: '#2563EB' }}>Flow</span>
          </span>
        </div>

        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16h.01" />
          </svg>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#B91C1C', margin: 0, letterSpacing: '-0.2px' }}>{copy.title}</h1>
        </div>

        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: '0 0 12px' }}>{copy.message}</p>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: '0 0 32px' }}>{copy.hint}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href="/register"
            style={{ height: 44, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px -4px rgba(79,70,229,0.5)' }}
          >
            Recommencer l’inscription
          </Link>
          <Link
            href="/login"
            style={{ height: 44, display: 'grid', placeItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            J’ai déjà confirmé, me connecter
          </Link>
        </div>

        <p style={{ fontSize: 12, color: '#94A3B8', margin: '24px 0 0', textAlign: 'center' }}>
          Pensez à vérifier le dossier « Spam » ou « Promotions » de votre boîte mail.
        </p>
      </div>
    </main>
  )
}
