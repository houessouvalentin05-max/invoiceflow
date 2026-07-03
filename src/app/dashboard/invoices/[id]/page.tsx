'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PDFDownloadButton } from '@/features/invoices/components/PDFDownloadButton'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Invoice {
  id: string
  invoice_number: string
  status: string
  currency: string
  subtotal: number
  tax: number
  total: number
  due_date: string | null
  created_at: string
  client: { name: string; email: string } | null
  items: InvoiceItem[]
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  overdue: 'En retard',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  viewed: 'bg-purple-100 text-purple-600',
  paid: 'bg-green-100 text-green-600',
  overdue: 'bg-red-100 text-red-600',
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(res => res.json())
      .then(data => {
        setInvoice(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="text-gray-500">Chargement...</p>
  if (!invoice) return <p className="text-red-500">Facture introuvable</p>

  const pdfData = {
    id: invoice.id,
    clientName: invoice.client?.name || 'Client inconnu',
    date: new Date(invoice.created_at).toLocaleDateString('fr-FR'),
    dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—',
    currency: invoice.currency,
    items: (invoice.items || []).map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={() => router.back()}
          className="text-left text-sm font-semibold text-[#64748B] hover:text-[#111827]"
        >
          ← Retour
        </button>
        <PDFDownloadButton invoice={pdfData} />
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#2563EB]">
              Facture
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
              Facture #{invoice.invoice_number}
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-bold text-[#111827]">Client</h2>
            <p className="font-semibold text-[#111827]">{invoice.client?.name || '—'}</p>
            <p className="text-sm text-[#64748B]">{invoice.client?.email || '—'}</p>
          </div>
          <div className="sm:text-right">
            <h2 className="mb-2 text-sm font-bold text-[#111827]">Échéance</h2>
            <p className="text-sm font-semibold text-[#111827]">
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]">
          <table className="w-full min-w-[680px]">
            <thead className="bg-[#F8FAFC]">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-[#64748B]">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qté</th>
                <th className="px-4 py-3">Prix unitaire</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(invoice.items || []).map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{item.unit_price.toLocaleString()} {invoice.currency}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#111827]">{item.total.toLocaleString()} {invoice.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-6 max-w-sm space-y-2 text-right">
          <p className="text-sm text-[#64748B]">Sous-total : <span className="font-semibold text-[#111827]">{invoice.subtotal.toLocaleString()} {invoice.currency}</span></p>
          <p className="text-sm text-[#64748B]">TVA (18%) : <span className="font-semibold text-[#111827]">{invoice.tax.toLocaleString()} {invoice.currency}</span></p>
          <p className="text-2xl font-extrabold text-[#111827]">Total : {invoice.total.toLocaleString()} {invoice.currency}</p>
        </div>
      </div>
    </div>
  )
}
