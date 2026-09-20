import type { Metadata } from "next";
import { HowToJsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { howItWorksSteps } from "@/lib/site-content";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = buildMetadata({
  title: "Cara Kerja Balikin",
  description:
    "Pelajari cara kerja Balikin dari pembuatan tag QR code, aktivasi mode hilang, hingga proses penemu menghubungi pemilik lewat WhatsApp.",
  path: "/how-it-works",
  keywords: ["cara kerja qr code barang hilang", "cara kerja balikin", "lost and found qr code"],
});

export default function HowItWorksPage() {
  return (
    <>
      <HowToJsonLd
        name="Cara Kerja Balikin"
        description="Pelajari cara kerja Balikin dari pembuatan tag QR code, aktivasi mode hilang, hingga proses penemu menghubungi pemilik lewat WhatsApp."
        steps={howItWorksSteps.map((s) => ({ name: s.title, text: s.description }))}
      />
      <div className="public-content-page min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <SiteHeader />
        <header className="bg-gradient-to-r from-brand-navy to-brand-red px-4 py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Cara Kerja Balikin</h1>
            <p className="text-xl text-red-100">Mudah dipakai pemilik barang, mudah dipahami penemu</p>
            <p className="mt-4 text-sm text-red-200">Lindungi barang Anda dengan QR Smart Tag dan tetap jaga privasi.</p>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-12">
          <ol className="list-none space-y-8" aria-label="Langkah-langkah penggunaan Balikin">
          {howItWorksSteps.map((step) => (
            <li key={step.step} className="rounded-xl border border-red-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-sm font-semibold text-white shadow-sm shadow-red-900/20" aria-hidden="true">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
              </div>
              <p className="pl-12 text-gray-700 leading-relaxed dark:text-slate-300">{step.description}</p>
            </li>
          ))}
          </ol>
          <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
            © 2026 Balikin.online · Smart Lost &amp; Found Platform Indonesia
          </div>
        </main>
      </div>
    </>
  );
}
