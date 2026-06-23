import Link from "next/link";

const STATS = [
  "Aucune carte bancaire requise",
  "Configuration en moins de 4 minutes",
  "XOF / USD / EUR supportés",
];

export function Hero() {
  return (
    <section className="px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2563eb]/20 bg-[#2563eb]/8 px-3.5 py-1.5 text-xs font-medium text-[#2563eb] sm:text-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10b981]" />
          </span>
          Nouveau — Paiements Mobile Money disponibles
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-[36px] font-extrabold leading-[1.08] tracking-tighter text-[#111827] sm:text-5xl lg:text-6xl">
          Facturez intelligemment.
          <br />
          <span className="text-[#2563eb]">Soyez payé plus vite.</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#64748b] sm:text-lg">
          La facturation professionnelle pensée pour les freelances et
          entreprises d&apos;Afrique et d&apos;ailleurs.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(37,99,235,0.3),0_4px_16px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
          >
            Commencer gratuitement
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-6 py-3.5 text-sm font-semibold text-[#0f172a] transition-all hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:shadow-md"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Voir la démo
          </a>
        </div>

        {/* Trust stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {STATS.map((stat) => (
            <div key={stat} className="flex items-center gap-1.5 text-xs text-[#64748b] sm:text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {stat}
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="relative mx-auto mt-16 max-w-5xl">
        <div
          className="pointer-events-none absolute -inset-10 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.08),0_40px_80px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 bg-[#111827] px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
            <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="h-3 w-3 rounded-full bg-[#10b981]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
            <aside className="hidden border-r border-[#e2e8f0] bg-[#fafbfc] p-4 sm:block">
              <div className="mb-4 flex items-center gap-2 p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563eb] text-[9px] font-black text-white">
                  IF
                </div>
                <span className="text-[13px] font-bold text-[#111827]">InvoiceFlow</span>
              </div>
              <nav className="flex flex-col gap-0.5 text-xs font-medium">
                <span className="rounded-md bg-[#2563eb]/8 px-2.5 py-1.5 text-[#2563eb]">
                  Tableau de bord
                </span>
                <span className="px-2.5 py-1.5 text-[#64748b]">Factures</span>
                <span className="px-2.5 py-1.5 text-[#64748b]">Clients</span>
                <span className="px-2.5 py-1.5 text-[#64748b]">Paiements</span>
                <span className="px-2.5 py-1.5 text-[#64748b]">Automatisations</span>
              </nav>
            </aside>

            <div className="bg-[#f8fafc] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-[#111827]">Tableau de bord</div>
                  <div className="text-[11px] text-[#64748b]">Juin 2026 · Tous les clients</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
                  <div className="text-[10px] font-medium text-[#64748b]">Revenu total</div>
                  <div className="text-xl font-extrabold tracking-tight text-[#111827]">2.4M</div>
                  <div className="mt-1 text-[10px] text-[#10b981]">↑ +18.4%</div>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
                  <div className="text-[10px] font-medium text-[#64748b]">En attente</div>
                  <div className="text-xl font-extrabold tracking-tight text-[#111827]">340K</div>
                  <div className="mt-1 text-[10px] text-[#f59e0b]">4 factures</div>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
                  <div className="text-[10px] font-medium text-[#64748b]">Payé ce mois</div>
                  <div className="text-xl font-extrabold tracking-tight text-[#111827]">1.9M</div>
                  <div className="mt-1 text-[10px] text-[#10b981]">↑ 12 factures</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                <div className="grid grid-cols-4 gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
                  <span>Client</span>
                  <span>Montant</span>
                  <span>Statut</span>
                  <span>Date</span>
                </div>
                {[
                  { client: "Agence Volta", amount: "450 000 F", status: "Payée", color: "#059669", bg: "rgba(16,185,129,0.1)", date: "14 juin" },
                  { client: "TechHub Dakar", amount: "280 000 F", status: "En attente", color: "#d97706", bg: "rgba(245,158,11,0.1)", date: "12 juin" },
                  { client: "Startup Abidjan", amount: "175 000 F", status: "En retard", color: "#dc2626", bg: "rgba(239,68,68,0.1)", date: "1 juin" },
                ].map((row) => (
                  <div
                    key={row.client}
                    className="grid grid-cols-4 gap-2 border-b border-[#f1f5f9] px-3.5 py-2 text-[11px] last:border-b-0"
                  >
                    <span className="font-semibold text-[#0f172a]">{row.client}</span>
                    <span className="font-bold text-[#0f172a]">{row.amount}</span>
                    <span>
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ color: row.color, backgroundColor: row.bg }}
                      >
                        {row.status}
                      </span>
                    </span>
                    <span className="text-[#64748b]">{row.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}