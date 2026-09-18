import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { HowToJsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { howItWorksSteps } from "@/lib/site-content";

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
      <MarketingShell
        title="Cara Kerja Balikin"
        description="Balikin dirancang agar mudah dipakai pemilik barang dan mudah dipahami oleh penemu."
      >
        <ol className="list-none space-y-8" aria-label="Langkah-langkah penggunaan Balikin">
           {howItWorksSteps.map((step) => (
             <li key={step.step} className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm shadow-red-900/5 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-sm font-semibold text-white shadow-sm shadow-red-900/20" aria-hidden="true">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
              </div>
              <p className="pl-11 text-gray-600 dark:text-slate-300">{step.description}</p>
            </li>
          ))}
        </ol>
      </MarketingShell>
    </>
  );
}
