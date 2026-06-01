import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Balikin - Layanan QR Tag Pintar untuk Amankan Barang Berharga",
  description:
    "Balikin adalah smart lost & found berbasis QR code untuk kunci, tas, dompet, dan barang pribadi agar penemu bisa menghubungi pemilik lewat WhatsApp dengan aman.",
  path: "/",
  keywords: [
    "gantungan kunci qr code",
    "qr code untuk barang hilang",
    "tag barang hilang",
    "gantungan kunci anti hilang",
    "smart lost and found indonesia",
  ],
});

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Balikin",
      url: absoluteUrl("/"),
      description:
        "Platform smart lost & found berbasis QR code untuk membantu barang hilang kembali ke pemilik.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd id="home-schema" data={homeSchema} />
      <HomePage />
    </>
  );
}
