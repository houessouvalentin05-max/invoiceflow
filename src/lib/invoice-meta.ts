// Source unique : statuts de facture, TVA, génération du n° de facture.
// Toute logique liée doit venir d'ici (DoD 2.5 : définie une seule fois).

export const INVOICE_STATUSES = [
  'draft',
  'pending',
  'sent',
  'viewed',
  'paid',
  'overdue',
] as const

export type InvoiceStatus = typeof INVOICE_STATUSES[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  overdue: 'En retard',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; color: string; dot: string }> = {
  paid:    { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10B981' },
  pending: { bg: 'rgba(245,158,11,0.12)', color: '#D97706', dot: '#F59E0B' },
  overdue: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626', dot: '#EF4444' },
  draft:   { bg: 'rgba(100,116,139,0.1)', color: '#475569', dot: '#94A3B8' },
  sent:    { bg: 'rgba(37,99,235,0.1)',   color: '#2563EB', dot: '#2563EB' },
  viewed:  { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED', dot: '#7C3AED' },
}

// TVA Togo par défaut, utilisée en fallback si le profil ne renseigne rien d'autre.
export const DEFAULT_TVA_RATE = 0.18

// Taux depuis profiles.default_tva (chaîne en pourcentage, ex. "18") → fraction (0.18).
export function tvaRate(defaultTva?: string | null): number {
  const num = Number(defaultTva)
  if (Number.isFinite(num) && num > 0) return num / 100
  return DEFAULT_TVA_RATE
}

// N° de facture : généré côté serveur uniquement (jamais côté client).
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 900000 + 100000)
  return `FAC-${year}-${rand}`
}