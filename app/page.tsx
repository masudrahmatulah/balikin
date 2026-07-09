import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqItems } from "@/lib/site-content";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Balikin Smart Tag - QR Code Anti Hilang Indonesia dengan Anonymous WhatsApp Gateway",
  description:
    "Balikin Smart Tag: Platform Smart Lost and Found Indonesia dengan QR Code dinamis. Penemu WhatsApp Anda 100% anonim. Lacak lokasi barang hilang, mode hilang darurat, privasi terjaga. Sistem gantungan kunci anti hilang dengan teknologi QR code modern. Mulai gratis sekarang!",
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
    "qr code whatsapp anonim",
    "lacak lokasi dari scan qr",
    "sistem pelacakan qr code",
    "mode hilang qr code",
    "sistem lost and found",
    "anonymous whatsapp gateway",
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

// SEO Note: Comprehensive Schema Markup with SoftwareApplication, Organization, FAQPage, WebPage, Product, and LocalBusiness
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: "Balikin",
      alternateName: "Balikin Smart Tag",
      url: absoluteUrl("/"),
      description:
        "Platform Smart Lost and Found Indonesia berbasis QR Code dinamis untuk menghubungkan barang hilang dengan pemiliknya melalui Anonymous WhatsApp Gateway dengan teknologi pelacakan lokasi real-time.",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo-icon.png"),
        width: 200,
        height: 200,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: "Indonesian",
      },
      knowsAbout: [
        "Smart Lost and Found System",
        "QR Code Technology",
        "Anonymous WhatsApp Gateway",
        "Location Tracking System",
      ],
    },
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
          priceValidUntil: "2025-12-31",
          description: "Paket gratis selamanya dengan fitur dasar QR code pelacakan barang hilang",
          name: "Balikin Free",
        },
        {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: "35000",
          priceValidUntil: "2025-12-31",
          description: "Paket premium dengan fitur mode hilang darurat dan notifikasi real-time",
          name: "Balikin Premium",
        },
      ],
      featureList: [
        "QR Code dinamis untuk pelacakan barang hilang",
        "Anonymous WhatsApp Gateway dengan privasi 100%",
        "Live Scan Location Tracking dengan geo-lokasi akurat",
        "Lost Mode Emergency Display dengan desain darurat merah",
        "Real-time Alert System untuk notifikasi scan",
        "No App Required - berbasis web yang dapat diakses semua perangkat",
        "Sistem identifikasi barang dengan QR code modern",
        "Gantungan kunci QR code anti hilang berkualitas",
      ],
      description: "Sistem keamanan privasi untuk barang hilang dengan QR Code dinamis. Platform smart lost and found Indonesia yang menghubungkan penemu dengan pemilik barang secara aman dan anonim.",
      keywords: "qr code barang hilang, qr code anti hilang, gantungan kunci qr code, smart lost and found, sistem pelacakan barang, anonymous whatsapp",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "50",
        bestRating: "5",
        worstRating: "1",
      },
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
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice: "0",
        highPrice: "150000",
      },
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
        keywords: item.question.toLowerCase().includes("hilang") ? "qr code barang hilang, mode hilang, sistem lost and found" : undefined,
      })),
    },
    {
      "@type": "WebPage",
      "@id": absoluteUrl("/#webpage"),
      url: absoluteUrl("/"),
      name: "Balikin Smart Tag - QR Code Anti Hilang & Platform Smart Lost and Found Indonesia",
      description: "Balikin Smart Tag: Sistem QR code dinamis untuk barang hilang dengan privasi 100%. Anonymous WhatsApp gateway, lacak lokasi scan, mode hilang darurat. Gantungan kunci QR code anti hilang gratis.",
      inLanguage: "id-ID",
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl("/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp"),
      },
      about: {
        "@type": "Thing",
        name: "Smart Lost and Found System dengan QR Code Pelacakan",
        description: "Sistem modern untuk menemukan barang hilang menggunakan teknologi QR code dengan fitur lokasi real-time dan komunikasi anonim",
      },
      mainEntity: {
        "@type": "Thing",
        name: "Balikin Smart Tag",
        description: "Platform terpadu untuk sistem lost and found dengan QR code anti hilang dan teknologi anonymous whatsapp gateway",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bagaimana Cara Kerja",
            item: absoluteUrl("/how-it-works"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Harga",
            item: absoluteUrl("/pricing"),
          },
        ],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": absoluteUrl("/#local-business"),
      name: "Balikin Smart Tag Indonesia",
      image: absoluteUrl("/logo-icon.png"),
      description: "Platform smart lost and found Indonesia dengan sistem QR code pelacakan barang hilang terkemuka",
      telephone: "+62XXX",
      areaServed: "ID",
      priceRange: "IDR 0 - IDR 150000",
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
