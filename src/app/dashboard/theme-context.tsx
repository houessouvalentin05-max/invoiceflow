'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'

interface DashboardThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | undefined>(undefined)

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('invoiceflow-theme') as ThemeMode | null
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setThemeState(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('invoiceflow-theme', theme)
  }, [theme])

  const value = useMemo<DashboardThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark')),
    setTheme: (nextTheme: ThemeMode) => setThemeState(nextTheme),
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(prev => !prev),
  }), [theme, sidebarCollapsed])

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  )
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext)

  if (!context) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider')
  }

  return context
}
