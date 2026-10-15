import { describe, expect, it } from 'vitest'
import { GUEST_INVOICE_FINALIZE_PATH, safePostAuthPath } from './auth-redirect'

describe('safePostAuthPath', () => {
  it('preserves the guest invoice finalization route', () => {
    expect(safePostAuthPath(GUEST_INVOICE_FINALIZE_PATH)).toBe(GUEST_INVOICE_FINALIZE_PATH)
  })

  it('falls back to the dashboard for unknown and external destinations', () => {
    expect(safePostAuthPath(null)).toBe('/dashboard')
    expect(safePostAuthPath('https://example.com')).toBe('/dashboard')
    expect(safePostAuthPath('//example.com')).toBe('/dashboard')
  })
})