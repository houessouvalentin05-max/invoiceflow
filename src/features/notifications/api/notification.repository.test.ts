import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocke la couche serveur Supabase pour vérifier que TOUTE requête notifications
// est scopée au user_id (isolation locataires, règle absolue du repo).
const supabaseFromMock = vi.fn()
const supabaseAuthGetUserMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: supabaseFromMock,
    auth: { getUser: supabaseAuthGetUserMock },
  })),
}))

import * as repo from './notification.repository'

function mockBuilder({ data = [], error = null, singleRow = null, count = 0 }: { data?: unknown; error?: unknown; singleRow?: unknown; count?: number } = {}) {
  const eqCalls: Array<[string, unknown]> = []
  let headSelect = false

  const builder = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn((_cols: unknown, opts?: { head?: boolean }) => {
      if (opts && opts.head) headSelect = true
      return builder
    }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn((col: string, val: unknown) => {
      eqCalls.push([col, val])
      return builder
    }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleRow ?? data, error }),
    then(on?: unknown, rej?: unknown) {
      const resolved = headSelect ? { data: null, count, error } : { data, error }
      return Promise.resolve(resolved).then(on as () => unknown, rej as () => unknown)
    },
  }

  supabaseFromMock.mockReturnValue(builder)
  return { builder, eqCalls }
}

describe('notification.repository — isolation par user_id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listNotifications interroge la table et filtre par user_id', async () => {
    const { builder, eqCalls } = mockBuilder({ data: [{ id: 'n1' }] })
    const rows = await repo.listNotifications('user-1')

    expect(supabaseFromMock).toHaveBeenCalledWith('notifications')
    expect(eqCalls).toEqual(expect.arrayContaining([['user_id', 'user-1']]))
    expect(builder.order).toHaveBeenCalled()
    expect(builder.limit).toHaveBeenCalledWith(30)
    expect(rows).toHaveLength(1)
  })

  it('countUnreadNotifications filtre user_id + read=false et retourne le compte', async () => {
    const { eqCalls } = mockBuilder({ count: 3 })
    const n = await repo.countUnreadNotifications('user-1')

    expect(n).toBe(3)
    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['user_id', 'user-1'],
        ['read', false],
      ])
    )
  })

  it('createNotificationDb insère avec user_id', async () => {
    const { builder } = mockBuilder({ singleRow: { id: 'n1' } })
    await repo.createNotificationDb('user-1', { type: 'payment_received', reference: { invoiceId: 'i1' } } as never)

    expect(supabaseFromMock).toHaveBeenCalledWith('notifications')
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', type: 'payment_received', reference: { invoiceId: 'i1' } })
    )
  })

  it('markNotificationRead filtre par id ET user_id', async () => {
    const { eqCalls } = mockBuilder({})
    await repo.markNotificationRead('n1', 'user-1')

    expect(eqCalls).toEqual(
      expect.arrayContaining([
        ['id', 'n1'],
        ['user_id', 'user-1'],
      ])
    )
    expect(eqCalls).not.toEqual(expect.arrayContaining([['id', 'n2']]))
  })
})