import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { HelpdeskChat } from "@/components/helpdesk-chat";

export const metadata: Metadata = {
  title: "Helpdesk Balikin | Bantuan Akun dan QR Tag",
  description: "Pusat bantuan Balikin dengan FAQ, konsultasi AI, dan eskalasi ke CS/admin.",
  alternates: { canonical: "/helpdesk" },
};

export default function HelpdeskPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/help" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><ArrowLeft className="h-4 w-4" /> Pusat Bantuan</Link>
        <header className="mb-8 max-w-2xl">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-600 p-3 text-white"><HelpCircle className="h-6 w-6" /></div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Helpdesk Balikin</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Cari jawaban, konsultasikan kendala dengan AI, dan lanjutkan ke CS/admin bila membutuhkan verifikasi manual.</p>
        </header>
        <HelpdeskChat />
      </div>
    </main>
  );
}
