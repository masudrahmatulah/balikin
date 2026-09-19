import type { Metadata } from "next";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { HelpdeskChat } from "@/components/helpdesk-chat";

export const metadata: Metadata = {
  title: "Helpdesk Balikin | Bantuan Akun dan QR Tag",
  description: "Pusat bantuan Balikin dengan FAQ, konsultasi AI, dan eskalasi ke CS/admin.",
  alternates: { canonical: "/helpdesk" },
};

export default function HelpdeskPage() {
  return (
    <div className="public-content-page min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="bg-gradient-to-r from-brand-navy to-brand-red px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Helpdesk Balikin</h1>
          <p className="text-xl text-red-100">Bantuan cepat untuk akun dan QR Smart Tag</p>
          <p className="mt-4 text-sm text-red-200">Konsultasikan kendala Anda dengan AI atau lanjutkan ke CS Balikin.</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <section className="not-prose">
          <a href="/help" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-red dark:text-slate-400 dark:hover:text-red-300">
          <ArrowLeft className="h-4 w-4" />
          Pusat Bantuan
        </a>
          <HelpdeskChat />
        </section>
        <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
          © 2026 Balikin.online · Smart Lost &amp; Found Platform Indonesia
        </div>
      </main>
    </div>
  );
}
