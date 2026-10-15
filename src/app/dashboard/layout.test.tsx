import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}))
vi.mock('@/lib/use-viewport', () => ({ useIsMobile: vi.fn(() => true) }))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signOut: vi.fn(),
    },
  }),
}))
vi.mock('@/app/dashboard/theme-context', () => ({
  DashboardThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDashboardTheme: () => ({
    theme: 'light', toggleTheme: vi.fn(), setTheme: vi.fn(),
    sidebarCollapsed: false, toggleSidebar: vi.fn(),
  }),
}))
vi.mock('@/features/notifications/notifications-context', () => ({
  NotificationsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/components/ui/NotificationBell', () => ({ NotificationBell: () => null }))

import DashboardLayout from './layout'

describe('DashboardLayout — sidebar mobile', () => {
  it('replie automatiquement la sidebar après un clic sur un lien de navigation', async () => {
    const user = userEvent.setup()
    render(<DashboardLayout><div>contenu page</div></DashboardLayout>)

    // Fermée au départ : pas d'overlay de fond.
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    const aside = document.querySelector('aside')!
    expect(aside).toHaveStyle({ transform: 'translateX(-100%)' })

    // Ouverture via le bouton hamburger.
    await user.click(screen.getByTitle('Ouvrir le menu'))
    expect(await screen.findByRole('presentation')).toBeInTheDocument()
    expect(aside).toHaveStyle({ transform: 'translateX(0)' })

    // Clic sur un lien de nav : le drawer se replie immédiatement.
    await user.click(screen.getByRole('link', { name: 'Clients' }))
    await waitFor(() => expect(screen.queryByRole('presentation')).not.toBeInTheDocument())
    expect(aside).toHaveStyle({ transform: 'translateX(-100%)' })
  })
})
