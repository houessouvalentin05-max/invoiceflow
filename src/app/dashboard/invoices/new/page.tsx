'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

interface Item {
  description: string
  quantity: number
  unit_price: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_id: '',
    invoice_number: `INV-${Date.now()}`,
    currency: 'XOF',
    due_date: '',
  })
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(setClients)
  }, [])

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof Item, value: string | number) {
    setItems(items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax = subtotal * 0.18
  const total = subtotal + tax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items }),
    })

    if (!res.ok) {
      setError('Erreur lors de la création')
      setLoading(false)
      return
    }

    router.push('/dashboard/invoices')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle facture</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Facture *</label>
              <input
                value={form.invoice_number}
                onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              >
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Articles</h2>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
                placeholder="Description *"
                required
                className="col-span-6 border rounded-lg px-3 py-2 text-gray-900"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                min="1"
                className="col-span-2 border rounded-lg px-3 py-2 text-gray-900"
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={e => updateItem(index, 'unit_price', Number(e.target.value))}
                placeholder="Prix"
                min="0"
                className="col-span-3 border rounded-lg px-3 py-2 text-gray-900"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="col-span-1 text-red-500 hover:text-red-700"
                >✕</button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            + Ajouter un article
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="space-y-2 text-right">
            <p className="text-gray-500">Sous-total : <span className="font-medium text-gray-900">{subtotal.toLocaleString()} {form.currency}</span></p>
            <p className="text-gray-500">TVA (18%) : <span className="font-medium text-gray-900">{tax.toLocaleString()} {form.currency}</span></p>
            <p className="text-lg font-bold text-gray-900">Total : {total.toLocaleString()} {form.currency}</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer la facture'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}