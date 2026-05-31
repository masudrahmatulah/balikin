import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { FAQPageJsonLd } from "@/components/json-ld";
import { FAQItem } from "@/components/faq-item";
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
    <>
      <FAQPageJsonLd questions={faqItems} />
      <MarketingShell
        title="FAQ Balikin"
        description="Jawaban ringkas untuk pertanyaan yang paling sering diajukan calon pengguna Balikin."
      >
        <div className="not-prose space-y-1" role="list" aria-label="Pertanyaan yang sering diajukan">
          {faqItems.map((item, index) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} index={index} />
          ))}
        </div>
      </MarketingShell>
    </>
  );
}
