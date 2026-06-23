const FEATURES = [
  {
    title: "Générateur de factures intelligent",
    desc: "Créez des factures professionnelles en quelques secondes. Taxes et totaux calculés automatiquement.",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    title: "Paiements Mobile Money",
    desc: "Acceptez MTN Mobile Money, Orange Money, Visa et virements bancaires au même endroit.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: "Automatisations",
    desc: "Rappels, factures récurrentes et emails de confirmation envoyés automatiquement.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Analytique de revenus",
    desc: "Suivez le revenu mensuel, les délais de paiement et les soldes impayés en un coup d'œil.",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Gestion des clients",
    desc: "Base de données clients complète avec historique de paiement et revenu total.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Exports PDF & CSV",
    desc: "Exportez vos factures en PDF, générez des rapports mensuels et résumés fiscaux.",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.08)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-xl text-center sm:mb-16">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Fonctionnalités
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Tout ce qu&apos;il faut pour gérer votre facturation.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#64748b] sm:text-lg">
            Une boîte à outils complète, de la création de facture au suivi
            des paiements.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#cbd5e1] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: feature.bg, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-[16px] font-bold text-[#111827]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#64748b]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}