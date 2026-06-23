import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-[#111827] px-4 py-24 text-center sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tighter text-white sm:text-5xl">
          Prêt à être payé à temps ?
        </h2>
        <p className="mt-4 text-lg text-white/50">
          Rejoignez des centaines de freelances et d&apos;entreprises qui utilisent
          déjà InvoiceFlow.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#111827] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          >
            Créer votre compte gratuit →
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-white/10 bg-white/[0.08] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.12]"
          >
            Nous contacter
          </Link>
        </div>
        <p className="mt-5 text-[13px] text-white/30">
          Gratuit pour toujours. Aucune carte bancaire. Configuration en moins de
          4 minutes.
        </p>
      </div>
    </section>
  );
}