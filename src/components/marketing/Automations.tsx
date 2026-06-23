const AUTOMATION_BENEFITS = [
  "Rappels automatiques pour factures en retard",
  "Génération de factures récurrentes",
  "Emails de confirmation de paiement",
];

export function Automations() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <div className="max-w-md rounded-2xl bg-[#111827] p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#34d399]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Exemple d&apos;automatisation
            </div>

            <div className="mb-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Déclencheur
              </div>
              <div className="text-[13px] font-medium text-white/90">
                Facture impayée après 7 jours
              </div>
            </div>
            <div className="my-1 flex justify-center text-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            <div className="mb-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Condition
              </div>
              <div className="text-[13px] font-medium text-white/90">
                Montant &gt; 50 000 F CFA
              </div>
            </div>
            <div className="my-1 flex justify-center text-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            <div className="rounded-lg border border-[#10b981]/30 bg-[#10b981]/[0.08] px-4 py-3.5">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#34d399]/80">
                Action
              </div>
              <div className="text-[13px] font-medium text-[#34d399]">
                Envoyer un rappel de paiement
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Automatisations
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Laissez InvoiceFlow travailler pendant votre sommeil.
          </h2>
          <p className="mb-8 mt-4 max-w-md text-base leading-relaxed text-[#64748b] sm:text-lg">
            Créez des règles d&apos;automatisation qui gèrent vos relances et
            factures récurrentes sans lever le petit doigt.
          </p>
          <ul className="flex flex-col gap-3.5">
            {AUTOMATION_BENEFITS.map((benefit) => (
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
      </div>
    </section>
  );
}