import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "gratuit pour toujours",
    desc: "Idéal pour démarrer.",
    features: ["5 factures / mois", "2 clients", "Export PDF"],
    cta: "Commencer gratuitement",
    featured: false,
  },
  {
    name: "Pro",
    price: "9 900",
    period: "par mois",
    desc: "Pour les freelances en croissance.",
    features: [
      "Factures illimitées",
      "Clients illimités",
      "Paiements Mobile Money",
      "Automatisations",
      "Support prioritaire",
    ],
    cta: "Essayer Pro — 14 jours gratuits",
    featured: true,
  },
  {
    name: "Business",
    price: "24 900",
    period: "par mois",
    desc: "Pour les équipes multi-entreprises.",
    features: [
      "Tout dans Pro",
      "5 membres d'équipe",
      "Accès API",
      "Compte dédié",
    ],
    cta: "Contacter les ventes",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-[#f8fafc] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-md text-center sm:mb-16">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Tarifs
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Une tarification simple et transparente.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#64748b] sm:text-lg">
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-7 transition-all hover:-translate-y-1 sm:p-8 ${
                plan.featured
                  ? "border-[#2563eb] shadow-[0_0_0_1px_#2563eb,0_8px_32px_rgba(37,99,235,0.15)]"
                  : "border-[#e2e8f0] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2563eb] px-3.5 py-1 text-[11px] font-bold text-white">
                  Le plus populaire
                </span>
              )}

              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#64748b]">
                {plan.name}
              </div>
              <div className="text-[36px] font-extrabold leading-none tracking-tighter text-[#111827] sm:text-[40px]">
                <span className="mr-0.5 align-top text-base font-medium text-[#64748b]">XOF</span>
                {plan.price}
              </div>
              <div className="mb-5 mt-1.5 text-[13px] text-[#64748b]">{plan.period}</div>
              <p className="mb-6 text-sm leading-relaxed text-[#64748b]">{plan.desc}</p>

              <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-[#0f172a]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.featured ? "/register" : plan.name === "Business" ? "/contact" : "/register"}
                className={`block rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                  plan.featured
                    ? "bg-[#2563eb] text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:bg-[#1d4ed8]"
                    : "border border-[#e2e8f0] text-[#0f172a] hover:border-[#2563eb] hover:text-[#2563eb]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}