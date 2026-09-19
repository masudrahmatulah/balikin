import type { Metadata } from "next";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { HelpdeskChat } from "@/components/helpdesk-chat";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "Helpdesk Balikin | Bantuan Akun dan QR Tag",
  description: "Pusat bantuan Balikin dengan FAQ, konsultasi AI, dan eskalasi ke CS/admin.",
  alternates: { canonical: "/helpdesk" },
};

export default function HelpdeskPage() {
  return (
    <MarketingShell
      title="Helpdesk Balikin"
      description="Cari jawaban, konsultasikan kendala dengan AI, dan lanjutkan ke CS/admin bila membutuhkan verifikasi manual."
    >
      <section className="not-prose">
        <a href="/help" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-red dark:text-slate-400 dark:hover:text-red-300">
          <ArrowLeft className="h-4 w-4" />
          Pusat Bantuan
        </a>
        <div className="mb-6 inline-flex rounded-2xl bg-brand-red p-3 text-white shadow-md shadow-red-900/15">
          <HelpCircle className="h-6 w-6" />
        </div>
        <HelpdeskChat />
      </section>
    </MarketingShell>
  );
}
