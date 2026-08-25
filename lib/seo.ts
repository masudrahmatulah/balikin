import type { Metadata } from "next";

const fallbackSiteUrl = "https://balikin.id";

export const siteConfig = {
  name: "Balikin",
  description:
    "Balikin adalah smart lost & found berbasis QR code untuk membantu barang hilang kembali ke pemilik dengan aman lewat WhatsApp.",
  // SEO Note: Expanded keywords array covering branded, generic, tech, and commercial terms
  keywords: [
    // Branded (High Priority)
    "Balikin",
    "balikin smart tag",
    "balikin qr code",
    "aplikasi balikin",
    "balikin lost and found",
    "sistem balikin",
    // Generic Fisik (Product-focused)
    "gantungan kunci qr code",
    "tag barang hilang",
    "smart lost and found",
    "qr code whatsapp",
    "label identitas barang",
    "gantungan kunci anti hilang",
    "qr code barang hilang",
    "qr code anti hilang",
    "stiker qr code anti hilang",
    "tag koper jamaah haji",
    "label barang qr code",
    "stiker qr code koper",
    "gantungan kunci motor qr code",
    // Tech Features
    "qr code whatsapp",
    "lacak lokasi dari scan qr",
    "sistem pelacakan qr code",
    "mode hilang qr code",
    "sistem lost and found",
    "sistem pelacakan barang hilang",
    "notifikasi whatsapp barang ditemukan",
    "scan logging dengan lokasi",
    // Use Cases
    "cara agar barang tidak hilang",
    "pelacakan barang hilang",
    "tag keamanan barang",
    "keamanan koper traveling",
    "keamanan dompet",
    // Commercial
    "harga smart tag balikin",
    "beli gantungan balikin",
    "paket keluarga anti hilang",
    "qr code keamanan barang",
    "tag qr code premium",
    // Location/Target
    "smart lost and found indonesia",
    "smart lost and found jakarta",
    "smart lost and found surabaya",
  ],
};

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    fallbackSiteUrl
  ).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  return `${getSiteUrl()}${path === "/" ? "" : path}`;
}

interface PageMetadataInput {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
