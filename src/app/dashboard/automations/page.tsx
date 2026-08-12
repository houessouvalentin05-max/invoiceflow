'use client'

import { useState } from 'react'
import { useDashboardTheme } from '@/app/dashboard/theme-context'

interface AutomationCard {
  key: string
  title: string
  description: string
  detail: string
  active: boolean
}

export default function AutomationsPage() {
  const { theme } = useDashboardTheme()
  const isDark = theme === 'dark'
  const surface = isDark ? '#111827' : '#fff'
  const border = isDark ? '#334155' : '#E2E8F0'
  const text = isDark ? '#F8FAFC' : '#0F172A'
  const muted = isDark ? '#94A3B8' : '#64748B'
  const accent = '#2563EB'

  const [automations, setAutomations] = useState<AutomationCard[]>([
    { key: 'reminders', title: 'Relances de paiement', description: 'Envoyer un rappel automatique 3 jours avant l’échéance et 7 jours après.', detail: 'Réduit les oublis et améliore la trésorerie.', active: true },
    { key: 'status', title: 'Mise à jour de statut', description: 'Passer automatiquement les factures en retard quand le paiement n’arrive pas.', detail: 'Gagne du temps sur la gestion quotidienne.', active: true },
    { key: 'followup', title: 'Suivi clients', description: 'Préparer un email de relance pour les clients récurrents à partir d’un modèle.', detail: 'Renforce la relation client sans effort manuel.', active: false },
  ])

  const toggleAutomation = (key: string) => {
    setAutomations(prev => prev.map(item => item.key === key ? { ...item, active: !item.active } : item))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Automatisations</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: text, letterSpacing: '-0.7px', margin: '0 0 6px' }}>Automatisez les tâches répétitives</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Définissez des règles simples pour gagner du temps et limiter les oublis.</p>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {automations.map((item) => (
          <div key={item.key} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 6px' }}>{item.title}</h2>
                <p style={{ fontSize: 13, color: muted, margin: '0 0 6px' }}>{item.description}</p>
                <p style={{ fontSize: 12, color: muted, margin: 0 }}>{item.detail}</p>
              </div>
              <button onClick={() => toggleAutomation(item.key)} style={{ height: 38, padding: '0 14px', borderRadius: 999, border: `1px solid ${border}`, background: item.active ? 'rgba(37,99,235,0.1)' : surface, color: item.active ? accent : muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {item.active ? 'Activée' : 'Désactivée'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: isDark ? '0 10px 24px -18px rgba(2,6,23,0.65)' : '0 10px 24px -18px rgba(15,23,42,0.2)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: text, margin: '0 0 10px' }}>Prochaine amélioration</h2>
        <p style={{ fontSize: 13, color: muted, margin: 0 }}>Ajoutez bientôt des règles plus poussées comme les paiements récurrents, les templates de relance ou la création automatique de factures périodiques.</p>
      </div>
    </div>
  )
}
