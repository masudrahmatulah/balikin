import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";

export const metadata: Metadata = buildMetadata({
  title: "FAQ Balikin",
  description:
    "Temukan jawaban untuk pertanyaan umum tentang Balikin, QR code barang hilang, privasi WhatsApp, harga, dan cara kerja smart lost & found.",
  path: "/faq",
  keywords: ["faq balikin", "pertanyaan qr code barang hilang", "faq smart lost and found"],
});

export default function FAQPage() {
  return (
    <MarketingShell
      title="FAQ Balikin"
      description="Jawaban ringkas untuk pertanyaan yang paling sering diajukan calon pengguna Balikin."
    >
      {faqItems.map((item) => (
        <section key={item.question} className="not-prose mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">{item.question}</h2>
          <p className="mt-3 text-gray-600">{item.answer}</p>
        </section>
      ))}
    </MarketingShell>
  );
}
