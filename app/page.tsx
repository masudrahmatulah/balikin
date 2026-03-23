import type { Metadata } from "next";
import Script from "next/script";
import { HomePage } from "@/components/home-page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";

export const metadata: Metadata = buildMetadata({
  title: "Gantungan Kunci QR Code untuk Barang Hilang",
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
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HomePage />
    </>
  );
}
