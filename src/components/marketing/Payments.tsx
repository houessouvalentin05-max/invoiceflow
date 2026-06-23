const PAYMENT_METHODS = [
  {
    name: "MTN MoMo",
    tag: "Mobile Money",
    color: "#FFCC00",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    name: "Orange Money",
    tag: "Mobile Money",
    color: "#FF6600",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    name: "Visa / Mastercard",
    tag: "Carte bancaire",
    color: "#2563eb",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    name: "Virement bancaire",
    tag: "Transfert",
    color: "#64748b",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 21 7 3 7 12 2" />
      </svg>
    ),
  },
];

const BENEFITS = [
  "Notifications de paiement instantanées",
  "Mise à jour automatique du statut des factures",
  "Multi-devises : XOF, USD, EUR, GBP",
  "Transactions sécurisées et chiffrées",
];

export function Payments() {
  return (
    <section id="payments" className="bg-[#f8fafc] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Paiements
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Portée mondiale, méthodes locales.
          </h2>
          <p className="mb-8 mt-4 max-w-md text-base leading-relaxed text-[#64748b] sm:text-lg">
            Vos clients paient comme ils le souhaitent. Vous êtes payé le jour
            même.
          </p>
          <ul className="flex flex-col gap-3.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-[#475569] sm:text-[15px]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10b981]/10">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.name}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-5 transition-all hover:-translate-y-1 hover:border-[#cbd5e1] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-6"
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${method.color}1A`, color: method.color }}
              >
                {method.icon}
              </div>
              <div className="text-sm font-bold text-[#111827]">{method.name}</div>
              <div className="mt-0.5 text-xs text-[#94a3b8]">{method.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}