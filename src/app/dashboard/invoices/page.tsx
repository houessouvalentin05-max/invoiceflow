'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total: number
  currency: string
  due_date: string | null
  created_at: string
  client: { name: string; email: string } | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  viewed: 'bg-purple-100 text-purple-600',
  paid: 'bg-green-100 text-green-600',
  overdue: 'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  overdue: 'En retard',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setInvoices(data)
        setLoading(false)
      })
  }, [])

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status } : inv)
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nouvelle facture
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-500">Aucune facture pour le moment</p>
          <Link href="/dashboard/invoices/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Créer ma première facture
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">N°</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 text-gray-500">{invoice.client?.name || '—'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {invoice.total.toLocaleString()} {invoice.currency}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={invoice.status}
                      onChange={e => handleStatusChange(invoice.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${statusColors[invoice.status]}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}