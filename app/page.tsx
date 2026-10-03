import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";
import { JsonLd, SiteGraphJsonLd } from "@/components/json-ld";
import { PREMIUM_PRICE } from "@/lib/constants";
import { PRODUCT_CATALOG } from "@/lib/product-catalog";

export const metadata: Metadata = buildMetadata({
  title: "Balikin Smart Tag - QR Code Anti Hilang Indonesia dengan Notifikasi WhatsApp",
  description:
    "Balikin Smart Tag: platform smart lost and found Indonesia dengan QR Code dinamis. Nomor HP tidak tercetak di barang. Catat scan dan perkiraan lokasi jika tersedia, aktifkan mode hilang, dan perbarui kontak kapan saja. Mulai gratis sekarang!",
  path: "/",
  keywords: [
    // Branded keywords
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
    "qr code whatsapp",
    "lacak lokasi dari scan qr",
    "sistem pelacakan qr code",
    "mode hilang qr code",
    "sistem lost and found",
    "notifikasi whatsapp barang ditemukan",
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
    // Long-tail keywords
    "aplikasi pelacak barang hilang gratis",
    "teknologi anti hilang terbaik",
    "sistem identifikasi barang dengan qr code",
  ],
});

// Keep product and software offers tied to the same catalog used by checkout.
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": absoluteUrl("/#software"),
      name: "Balikin Smart Tag",
      alternateName: "Balikin QR Code Anti Hilang",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web (All Platforms)",
      browserRequirements: "Requires JavaScript",
      offers: [
        {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: "0",
          description: "Paket gratis selamanya dengan fitur dasar QR code pelacakan barang hilang",
          name: "Balikin Free",
        },
        {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: PREMIUM_PRICE,
          description: "Tag fisik premium dengan fitur mode hilang dan notifikasi scan",
          name: "Balikin Premium",
        },
      ],
      featureList: [
        "QR Code dinamis untuk pelacakan barang hilang",
        "Notifikasi WhatsApp saat barang ditemukan",
        "Catatan scan dengan perkiraan lokasi jika tersedia",
        "Lost Mode Emergency Display dengan desain darurat merah",
        "Notifikasi dan riwayat scan sesuai konfigurasi layanan",
        "No App Required - berbasis web yang dapat diakses semua perangkat",
        "Sistem identifikasi barang dengan QR code modern",
        "Gantungan kunci QR code anti hilang berkualitas",
      ],
      description: "Sistem keamanan privasi untuk barang hilang dengan QR Code dinamis. Platform smart lost and found Indonesia yang menghubungkan penemu dengan pemilik barang secara aman tanpa nomor HP tercetak di tag.",
      keywords: "qr code barang hilang, qr code anti hilang, gantungan kunci qr code, smart lost and found, sistem pelacakan barang, whatsapp lost and found",
      screenshot: {
        "@type": "ImageObject",
        url: absoluteUrl("/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp"),
      },
    },
    {
      "@type": "Product",
      "@id": absoluteUrl("/#product-tag"),
      name: "Balikin Smart Tag - Gantungan Kunci QR Code",
      description: "Gantungan kunci QR code anti hilang dengan teknologi smart tag terkini untuk identifikasi barang dan sistem lost and found",
      brand: {
        "@type": "Brand",
        name: "Balikin",
      },
      keywords: "gantungan kunci qr code, tag barang hilang, qr code anti hilang, smart tag untuk kunci",
      offers: {
        "@type": "Offer",
        priceCurrency: "IDR",
        price: PRODUCT_CATALOG["armor-tag"].price,
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/produk#akrilik"),
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
        keywords: item.question.toLowerCase().includes("hilang") ? "qr code barang hilang, mode hilang, sistem lost and found" : undefined,
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <SiteGraphJsonLd
        path="/"
        name="Balikin Smart Tag - QR Code Anti Hilang & Platform Smart Lost and Found Indonesia"
        description="Balikin Smart Tag: Sistem QR code dinamis untuk barang hilang dengan kontak fleksibel. Notifikasi WhatsApp, lacak lokasi scan, mode hilang darurat."
        imageUrl={absoluteUrl("/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp")}
      />
      <JsonLd id="home-schema" data={homeSchema} />
      <HomePage />
    </>
  );
}
