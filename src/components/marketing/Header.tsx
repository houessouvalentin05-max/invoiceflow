import Link from "next/link";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Paiements", href: "#payments" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#e2e8f0] bg-[#f8fafc]/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="InvoiceFlow accueil" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden shrink-0 items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] sm:inline-block"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#2563eb] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1d4ed8] hover:shadow-md sm:px-4"
          >
            Essai gratuit
          </Link>
        </div>
      </div>
    </header>
  );
}