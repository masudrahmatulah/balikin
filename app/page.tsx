import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Takut Barang Hilang? Gunakan Balikin Smart Tag - QR Code Anti Hilang dengan Privasi Terjaga",
  description:
    "Balikin Smart Tag adalah sistem QR code dinamis untuk barang hilang. Penemu WhatsApp Anda 100% anonim tanpa lihat nomor asli. Lacak lokasi scan, mode hilang darurat. Mulai Rp 0 sekarang!",
  path: "/",
  keywords: [
    // SEO Note: Branded keywords (High Priority)
    "balikin smart tag",
    "balikin qr code",
    "aplikasi balikin",
    "balikin lost and found",
    "sistem balikin",
    // Problem + Solution keywords
    "qr code barang hilang",
    "qr code anti hilang",
    "tag barang hilang",
    "gantungan kunci qr code",
    "smart lost and found indonesia",
    "gantungan kunci anti hilang",
    // Tech Features keywords
    "qr code whatsapp anonim",
    "lacak lokasi dari scan qr",
    "sistem pelacakan qr code",
    "mode hilang qr code",
    "sistem lost and found",
    // Use Cases keywords
    "tag koper jamaah haji",
    "stiker qr code koper",
    "gantungan kunci motor qr code",
    "label identitas barang",
    "label barang qr code",
    // Commercial keywords
    "harga smart tag balikin",
    "beli gantungan balikin",
    "paket keluarga anti hilang",
    "qr code keamanan barang",
  ],
});

// SEO Note: Expanded Schema Markup with SoftwareApplication, Organization, FAQPage, and WebPage
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: "Balikin",
      url: absoluteUrl("/"),
      description:
        "Platform Smart Lost and Found Indonesia berbasis QR Code dinamis untuk menghubungkan barang hilang dengan pemiliknya melalui Anonymous WhatsApp Gateway.",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: "Indonesian",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": absoluteUrl("/#software"),
      name: "Balikin Smart Tag",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web (All Platforms)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
        description: "Versi digital gratis selamanya. Premium mulai Rp 35.000.",
      },
      featureList: [
        "Anonymous WhatsApp Gateway",
        "Live Scan Location Tracking",
        "Lost Mode Emergency Display",
        "Real-time Alert System",
        "No App Required",
      ],
      description: "Sistem keamanan privasi untuk barang hilang dengan QR Code dinamis.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "50",
      },
    },
    {
      "@type": "FAQPage",
      "@id": absoluteUrl("/#faq"),
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "WebPage",
      "@id": absoluteUrl("/#webpage"),
      url: absoluteUrl("/"),
      name: "Balikin Smart Tag - QR Code Barang Hilang & Smart Lost and Found Indonesia",
      description: "Sistem Smart Lost and Found Indonesia berbasis QR Code dinamis untuk barang hilang dengan privasi terjaga.",
      inLanguage: "id-ID",
      about: {
        "@type": "Thing",
        name: "Smart Lost and Found System",
      },
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
