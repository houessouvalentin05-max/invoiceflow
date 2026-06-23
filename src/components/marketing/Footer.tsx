import Link from "next/link";
import { Logo } from "./Logo";

const FOOTER_COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Intégrations", href: "/integrations" },
      { label: "Nouveautés", href: "/changelog" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Carrières", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Sécurité", href: "/security" },
      { label: "RGPD", href: "/gdpr" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Docs API", href: "/docs" },
      { label: "Statut", href: "/status" },
      { label: "Communauté", href: "/community" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#111827] px-4 py-12 text-sm text-white/50 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 sm:grid-cols-[220px_1fr]">
        <div>
          <Logo variant="dark" className="mb-3" />
          <p className="max-w-[200px] text-[13px] leading-relaxed text-white/35">
            La facturation de classe mondiale pour les entreprises qui visent haut.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[13px] font-semibold text-white/70">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/40 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-3 border-t border-white/[0.06] pt-6 text-[13px] sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} InvoiceFlow. Tous droits réservés.</span>
        <span>Conçu avec 🤍 pour les entreprises africaines</span>
      </div>
    </footer>
  );
}