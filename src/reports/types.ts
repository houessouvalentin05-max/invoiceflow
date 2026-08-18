import { InvoiceItem } from '@/features/invoices/types'

// Reports types for invoiceflow - Phase 3

// Types de rapports disponibles
export type ReportType = 
  | 'invoice-detail'       // Detail d'une facture unique
  | 'invoice-summary'      // Résumé des factures (par statut/période)
  | 'client-statement'     // État de compte client
  | 'revenue-analysis'     // Analyse de chiffre d'affaires
  | 'overdue-report'       // Rapport des factures en retard

// Paramètres de rapport
export interface ReportFilters {
  status?: string
  startDate?: string
  endDate?: string
  clientId?: string
  currency?: string
}

// Structure de base d'un rapport
export interface BaseReport {
  id: string
  type: ReportType
  generatedAt: Date
  filters: ReportFilters
}

// Rapports détaillés selon le type
export interface InvoiceDetailReport extends BaseReport {
  type: 'invoice-detail'
  invoiceId: string
  invoice: {
    id: string
    number: string
    clientName: string
    date: string
    dueDate: string
    status: string
    items: InvoiceItem[]
    subtotal: number
    tax: number
    total: number
    currency: string
  }
  client: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
  }
  company: {
    name: string
    address: string
    phone: string
    email: string
    logoUrl?: string
  }
  terms?: string  // Conditions générales de vente
}

export interface RevenueAnalysisReport extends BaseReport {
  type: 'revenue-analysis'
  period: 'month' | 'quarter' | 'year'
  totalRevenue: number          // Total TTC
  totalHT: number               // Total HT
  totalTax: number              // Total TVA
  byStatus: Record<string, { count: number; amount: number }>
  byCurrency: Record<string, { count: number; amount: number }>
  topClients: { id: string; name: string; revenue: number }[]
}

// État de compte client
export interface ClientStatementReport extends BaseReport {
  type: 'client-statement'
  clientId: string
  clientName: string
  openingBalance: number   // Solde précédent
  totalInvoiced: number    // Total facturé
  totalPaid: number        // Total payé
  closingBalance: number   // Solde final
  unpaidInvoices: {
    invoiceId: string
    number: string
    amount: number
    dueDate: string
    daysOverdue: number
  }[]
  recentPayments: {
    date: string
    amount: number
    method: string
    reference?: string
  }[]
}

// Rapport des factures en retard
export interface OverdueReport extends BaseReport {
  type: 'overdue-report'
  generatedAt: Date
  totalOverdue: number     // Montant total en retard
  overdueInvoices: {
    invoiceId: string
    number: string
    clientName: string
    amount: number
    dueDate: string
    daysOverdue: number
    ageCategory: '1-30' | '31-60' | '61-90' | '90+'  // Âge de la créance
  }[]
  summary: {
    count: number
    totalAmount: number
    averageDaysOverdue: number
  }
}