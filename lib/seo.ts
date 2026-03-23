import type { Metadata } from "next";

const fallbackSiteUrl = "https://balikin.id";

export const siteConfig = {
  name: "Balikin",
  description:
    "Balikin adalah smart lost & found berbasis QR code untuk membantu barang hilang kembali ke pemilik dengan aman lewat WhatsApp.",
  keywords: [
    "Balikin",
    "gantungan kunci qr code",
    "tag barang hilang",
    "smart lost and found",
    "qr code whatsapp",
    "label identitas barang",
    "gantungan kunci anti hilang",
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
