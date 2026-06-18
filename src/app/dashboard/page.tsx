export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Revenus ce mois</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">0 XOF</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Factures impayées</p>
          <p className="text-3xl font-bold text-orange-500 mt-2">0</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm text-gray-500">Total clients</p>
          <p className="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
      </div>
    </div>
  )
}