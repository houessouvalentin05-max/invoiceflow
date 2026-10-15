export const GUEST_INVOICE_FINALIZE_PATH = '/factures/finaliser'
export const AUTH_NEXT_PATH_KEY = 'invoiceflow-auth-next'

const POST_AUTH_PATHS = new Set([GUEST_INVOICE_FINALIZE_PATH])

export function safePostAuthPath(value: string | null | undefined): string {
  return value && POST_AUTH_PATHS.has(value) ? value : '/dashboard'
}