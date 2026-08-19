import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocke la couche serveur Supabase : on capture la chaîne d'appels pour
// vérifier que TOUTE requête est scopée au user_id (isolation locataires).
const supabaseFromMock = vi.fn()
const supabaseAuthGetUserMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: supabaseFromMock,
    auth: { getUser: supabaseAuthGetUserMock },
  })),
}))

import * as repo from './payment.repository'

/**
 * Construit un builder Supabase configurable pour capturer la chaîne
 * (insert/select/update/delete + eq) et répondre { data, error }.
 */
function mockBuilder({ data = [], error = null, single = null }: { data?: unknown; error?: unknown; single?: unknown } = {}) {
  const eqCalls: Array<[string, unknown]> = []

  // Résolution finale : les opérations qui se terminent par `await builder` (ex. sum)
  // récupèrent ici `{ data, error }` — comme le vrai client Supabase.
  const finalPromise = Promise.resolve({ data, error })

  const builder = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn((col: string, val: unknown) => {
      eqCalls.push([col, val])
      return builder
    }),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: single ?? data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data: single ?? data, error }),
    then(on?: unknown, rej?: unknown) {
      return (finalPromise as Promise<unknown>).then(on as () => unknown, rej as () => unknown)
    },
  }

  supabaseFromMock.mockReturnValue(builder)

  return { builder, eqCalls }
}

describe('payment.repository — isolation par user_id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createPaymentDb insère avec user_id', async () => {
    const { builder } = mockBuilder({ single: { id: 'p1' } })
    await repo.createPaymentDb('user-1', {
      invoice_id: 'inv-1',
      amount: 50,
      method: 'cash',
      reference: null,
      paid_at: '2026-01-01',
    } as never)

    expect(supabaseFromMock).toHaveBeenCalledWith('payments')
    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }))
  })

  it('getInvoiceTotal filtre par id ET user_id', async () => {
    const { eqCalls } = mockBuilder({ single: { total: 100 } })
    const total = await repo.getInvoiceTotal('inv-1', 'user-1')

    expect(total).toBe(100)
    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['id', 'inv-1'],
        ['user_id', 'user-1'],
      ]),
    )
  })

  it('sumInvoicePayments filtre par invoice_id ET user_id', async () => {
    const { eqCalls } = mockBuilder({ data: [{ amount: 60 }, { amount: 40 }] })
    const sum = await repo.sumInvoicePayments('inv-1', 'user-1')

    expect(sum).toBe(100)
    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['invoice_id', 'inv-1'],
        ['user_id', 'user-1'],
      ]),
    )
  })

  it('markInvoicePaid update scopé au user_id', async () => {
    const { eqCalls } = mockBuilder({})
    await repo.markInvoicePaid('inv-1', 'user-1', '2026-01-02')

    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['id', 'inv-1'],
        ['user_id', 'user-1'],
      ]),
    )
  })

  it('deletePayment filtre par id ET user_id', async () => {
    const { eqCalls } = mockBuilder({})
    await repo.deletePayment('p-1', 'user-1')

    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['id', 'p-1'],
        ['user_id', 'user-1'],
      ]),
    )
  })

  it('getPayments ne requête que les lignes du user_id', async () => {
    const { eqCalls } = mockBuilder({ data: [] })
    await repo.getPayments('user-1')

    expect(supabaseFromMock).toHaveBeenCalledWith('payments')
    expect(eqCalls).toEqual(expect.arrayContaining([['user_id', 'user-1']]))
  })
})