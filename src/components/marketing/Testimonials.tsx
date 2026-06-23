const TESTIMONIALS = [
  {
    text: "Avant InvoiceFlow, je passais des heures à relancer mes clients. Maintenant ils paient avant même que j'aie à relancer.",
    name: "Aminata Konaté",
    role: "Designer graphique · Abidjan",
    initials: "AK",
    color: "#2563EB",
  },
  {
    text: "Interface propre, rapide, et tout fonctionne. J'ai envoyé ma première facture 5 minutes après l'inscription.",
    name: "Kwame Diallo",
    role: "Développeur web · Dakar",
    initials: "KD",
    color: "#10B981",
  },
  {
    text: "Les automatisations ont fait gagner 3 heures par semaine à mon équipe. On se concentre sur le travail.",
    name: "Sophie Mensah",
    role: "Fondatrice d'agence · Lomé",
    initials: "SM",
    color: "#8B5CF6",
  },
];

function StarRating() {
  return (
    <div className="mb-4 flex gap-0.5 text-[#f59e0b]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-md text-center sm:mb-16">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Témoignages
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Utilisé partout en Afrique de l&apos;Ouest.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-7 transition-all hover:border-[#cbd5e1] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <StarRating />
              <p className="mb-6 text-[15px] leading-relaxed text-[#0f172a]">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#111827]">{t.name}</div>
                  <div className="text-xs text-[#64748b]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}