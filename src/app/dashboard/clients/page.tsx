'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [error, setError] = useState<string | null>(null)

  async function fetchClients() {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(data)
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      setError('Erreur lors de la création')
      return
    }
    setForm({ name: '', email: '', phone: '', address: '' })
    setShowForm(false)
    fetchClients()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce client ?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    fetchClients()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nouveau client
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Nouveau client</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nom *"
              required
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
            />
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
            />
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Téléphone"
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
            />
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Adresse"
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-gray-700">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-500">Aucun client pour le moment</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nom</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Téléphone</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 text-gray-500">{client.email || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{client.phone || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
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