"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "InvoiceFlow est-il gratuit pour commencer ?",
    a: "Oui. Notre plan gratuit vous permet d'envoyer jusqu'à 5 factures par mois et de gérer 2 clients — aucune carte bancaire requise.",
  },
  {
    q: "Quelles devises sont supportées ?",
    a: "InvoiceFlow supporte le XOF (FCFA), USD, EUR et GBP. Nous ajoutons régulièrement de nouvelles devises.",
  },
  {
    q: "Comment fonctionne le Mobile Money ?",
    a: "Votre client reçoit un lien de paiement et peut payer instantanément via MTN ou Orange Money. Vous êtes notifié immédiatement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui. Pas de contrat, pas d'engagement. Annulez à tout moment depuis vos paramètres.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Toutes les données sont chiffrées en transit et au repos via Supabase avec des politiques de sécurité au niveau des lignes.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#f8fafc] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            Vos questions, nos réponses.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#64748b] sm:text-lg">
            Vous ne trouvez pas votre réponse ? Écrivez à{" "}
            <span className="font-semibold text-[#0f172a]">hello@invoiceflow.io</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-semibold text-[#111827] transition-colors hover:bg-[#fafbff]"
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-[#64748b]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}