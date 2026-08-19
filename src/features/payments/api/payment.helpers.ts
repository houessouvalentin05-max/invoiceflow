// Logique pure « facture entièrement payée → marquer comme payée ».
// Extraite du submit handler / du service pour être testable en isolation (DoD 5.3).

/**
 * Détermine si une facture doit passer au statut `paid` après un paiement.
 *
 * @param totalPaid    Somme des paiements effectués sur la facture (dont celui en cours)
 * @param invoiceTotal Total de la facture
 * @returns `true` si la somme payée couvre (ou dépasse) le total de la facture
 */
export function shouldMarkInvoiceAsPaid(totalPaid: number, invoiceTotal: number): boolean {
  if (!Number.isFinite(totalPaid) || !Number.isFinite(invoiceTotal)) return false
  if (invoiceTotal <= 0) return false
  return totalPaid >= invoiceTotal
}