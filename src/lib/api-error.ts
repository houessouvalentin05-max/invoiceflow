import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleApiError(error: unknown) {
  // Échec de validation zod → 400 avec messages FR par champ
  if (error instanceof ZodError) {
    const details = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return NextResponse.json(
      { error: 'Données invalides.', details },
      { status: 400 }
    )
  }

  // Aucune ligne (ressource inexistante OU appartenant à un autre utilisateur) → 404
  if ((error as { code?: string }).code === 'PGRST116') {
    return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
  }

  // Erreur inattendue → log serveur + 500 générique
  console.error('[api-error]', error)
  return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
}