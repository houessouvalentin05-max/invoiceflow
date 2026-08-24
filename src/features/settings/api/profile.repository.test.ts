import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocke la couche serveur Supabase pour vérifier que la suppression de compte
// passe bien par la RPC sécurisée avec la user_id de la session (jamais une
// user_id arbitraire — régression pour le DoD 2.6).
const rpcMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({ rpc: rpcMock })),
}))

import * as repo from './profile.repository'

function mockRpc(result: { data: unknown; error: unknown }) {
  rpcMock.mockResolvedValue(result)
  return rpcMock
}

describe('profile.repository — suppression de compte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('appelle la RPC delete_user_account avec la user_id de la session', async () => {
    mockRpc({ data: true, error: null })

    const deleted = await repo.deleteUserAccount('user-1')

    expect(rpcMock).toHaveBeenCalledWith('delete_user_account', { user_id: 'user-1' })
    expect(deleted).toBe(true)
  })

  it('retourne false quand la RPC refuse (user_id != auth.uid())', async () => {
    mockRpc({ data: false, error: null })

    const deleted = await repo.deleteUserAccount('user-1')

    expect(deleted).toBe(false)
  })

  it('relance quand la RPC échoue techniquement', async () => {
    rpcMock.mockRejectedValue(new Error('rpc failed'))

    await expect(repo.deleteUserAccount('user-1')).rejects.toThrow('rpc failed')
  })
})
