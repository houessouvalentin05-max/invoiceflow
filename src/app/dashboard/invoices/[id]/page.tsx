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
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Retour
        </button>
        <PDFDownloadButton invoice={pdfData} />
      </div>

      <div className="bg-white rounded-2xl shadow p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Facture #{invoice.invoice_number}
            </h1>
            <p className="text-gray-500 mt-1">
              Créée le {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-gray-700 mb-2">Client</h2>
          <p className="text-gray-900 font-medium">{invoice.client?.name || '—'}</p>
          <p className="text-gray-500">{invoice.client?.email || '—'}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-gray-700 mb-3">Articles</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-2">Description</th>
                <th className="pb-2">Qté</th>
                <th className="pb-2">Prix unitaire</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(invoice.items || []).map(item => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-gray-500">{item.quantity}</td>
                  <td className="py-3 text-gray-500">{item.unit_price.toLocaleString()} {invoice.currency}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{item.total.toLocaleString()} {invoice.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-4 space-y-2 text-right">
          <p className="text-gray-500">Sous-total : <span className="font-medium text-gray-900">{invoice.subtotal.toLocaleString()} {invoice.currency}</span></p>
          <p className="text-gray-500">TVA (18%) : <span className="font-medium text-gray-900">{invoice.tax.toLocaleString()} {invoice.currency}</span></p>
          <p className="text-xl font-bold text-gray-900">Total : {invoice.total.toLocaleString()} {invoice.currency}</p>
          {invoice.due_date && (
            <p className="text-gray-500 text-sm">Échéance : {new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
          )}
        </div>
      </div>
    </div>
  )
}