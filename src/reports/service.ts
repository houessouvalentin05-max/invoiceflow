// Reports service for invoiceflow - Phase 3
import { INVOICE_STATUSES, generateInvoiceNumber } from '@/lib/invoice-meta'

interface CompanyOverride {
  name?: string
  address?: string
  phone?: string
  email?: string
}

// --- Rapport détail facture ---
export async function generateInvoiceDetailReport(invoiceId: string, overrides?: { company?: CompanyOverride; terms?: string }) {
  // TODO: Implémentation complète avec Supabase
  return {
    id: `report-${invoiceId}-${Date.now()}`,
    type: 'invoice-detail' as const,
    generatedAt: new Date(),
    filters: { invoiceId },
    invoice: {
      id: invoiceId,
      number: generateInvoiceNumber(),
      clientName: 'Client inconnu',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: 'EUR',
    },
    client: {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    company: {
      name: 'InvoiceFlow',
      address: '123 Rue d\'Exemple',
      phone: '+33 1 23 45 67 89',
      email: 'contact@invoiceflow.com',
    },
    terms: overrides?.terms || 'Conditions générales de vente standard.',
  }
}

// --- Rapport analyse chiffre d'affaires ---
export async function generateRevenueAnalysisReport(filters: { period?: 'month' | 'quarter' | 'year'; startDate?: string; endDate?: string } = {}) {
  const { period = 'month', startDate, endDate } = filters

  // TODO: Requête Supabase réelle avec filtres
  const mockInvoices = [
    { id: '1', total: 150, subtotal: 125, tax: 25, currency: 'EUR', status: 'paid', client_id: 'c1', date: '2024-01-15' },
    { id: '2', total: 200, subtotal: 170, tax: 30, currency: 'EUR', status: 'paid', client_id: 'c1', date: '2024-01-20' },
    { id: '3', total: 75, subtotal: 65, tax: 10, currency: 'EUR', status: 'pending', client_id: 'c2', date: '2024-02-05' },
  ]

  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalHT = mockInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const totalTax = mockInvoices.reduce((sum, inv) => sum + inv.tax, 0)

  // Regroupement par statut
  const byStatus: Record<string, { count: number; amount: number }> = {}
  INVOICE_STATUSES.forEach(status => {
    byStatus[status] = { count: 0, amount: 0 }
  })

  mockInvoices.forEach(inv => {
    const status = inv.status || 'draft'
    if (byStatus[status]) {
      byStatus[status].count++
      byStatus[status].amount += inv.total || 0
    }
  })

  // Top clients simplifié
  const clientRevenues: Map<string, { name: string; revenue: number }> = new Map()
  clientRevenues.set('c1', { name: 'Client A', revenue: 350 })
  clientRevenues.set('c2', { name: 'Client B', revenue: 75 })

  const topClients = Array.from(clientRevenues.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([id, data]) => ({ id, name: data.name, revenue: data.revenue }))

  return {
    id: `revenue-analysis-${Date.now()}`,
    type: 'revenue-analysis' as const,
    generatedAt: new Date(),
    filters: { period, startDate, endDate },
    period,
    totalRevenue,
    totalHT,
    totalTax,
    byStatus,
    byCurrency: { EUR: { count: mockInvoices.length, amount: totalRevenue } },
    topClients,
  }
}

// --- État de compte client ---
export async function generateClientStatementReport(clientId: string) {
  // TODO: Implémentation complète avec Supabase
  return {
    id: `statement-${clientId}-${Date.now()}`,
    type: 'client-statement' as const,
    generatedAt: new Date(),
    filters: { clientId },
    clientId,
    clientName: 'Client inconnu',
    openingBalance: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    closingBalance: 0,
    unpaidInvoices: [],
    recentPayments: [],
  }
}

// --- Rapport factures en retard ---
export async function generateOverdueReport(filters: { startDate?: string; endDate?: string } = {}) {
  // TODO: Requête Supabase réelle avec filtres
  const mockInvoices = [
    { id: '1', total: 200, due_date: '2024-01-15', status: 'overdue' },
    { id: '2', total: 150, due_date: '2024-02-01', status: 'overdue' },
    { id: '3', total: 300, due_date: '2024-03-01', status: 'paid' },
  ]

  const totalOverdue = mockInvoices.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
  const overdueInvoices = mockInvoices
    .filter((inv) => inv.status === 'overdue')
    .map((inv) => ({
      invoiceId: inv.id,
      number: generateInvoiceNumber(),
      clientName: 'Client inconnu',
      amount: inv.total,
      dueDate: inv.due_date,
      daysOverdue: 45,
      ageCategory: '31-60',
    }))

  return {
    id: `overdue-report-${Date.now()}`,
    type: 'overdue-report' as const,
    generatedAt: new Date(),
    filters,
    totalOverdue,
    overdueInvoices,
    summary: {
      count: overdueInvoices.length,
      totalAmount: totalOverdue,
      averageDaysOverdue: 45,
    }
  }
}