import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import {
  FREE_TAG_LIMIT,
  PRINTABLE_FIVE_PRICE,
  PRINTABLE_SINGLE_PRICE,
  PRINTABLE_TEN_PRICE,
  PREMIUM_PRICE,
} from "@/lib/constants";
import { PRODUCT_CATALOG } from "@/lib/product-catalog";
import { howItWorksSteps } from "@/lib/site-content";
import { absoluteUrl } from "@/lib/seo";

const APP_ID = "balikin_id";

function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

function cleanText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export async function GET() {
  let posts: Array<{
    title: string;
    slug: string;
    summary: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
  }> = [];

  try {
    posts = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.app_id, APP_ID),
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt),
      ),
      orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
      columns: {
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to load published posts for llms.txt:", error);
  }

  const catalogLines = Object.values(PRODUCT_CATALOG).map((product) => {
    const pack = product.packSize > 1 ? `, isi ${product.packSize}` : "";
    return `- ${product.name}: ${formatPrice(product.price)}${pack}.`;
  });

  const lines = [
    "# Balikin",
    "> Balikin adalah platform smart lost & found berbasis QR code di Indonesia yang membantu pemilik barang mengelola identitas digital dan menghubungkan penemu dengan pemilik.",
    "",
    "Balikin menyediakan tag QR digital, produk fisik QR, dan halaman publik dinamis untuk membantu proses pengembalian barang. Informasi harga dapat berubah; gunakan halaman harga dan produk sebagai sumber terbaru.",
    "",
    "## Identitas dan Halaman Utama",
    `- Beranda: ${absoluteUrl("/")}`,
    `- Cara kerja: ${absoluteUrl("/how-it-works")}`,
    `- Produk: ${absoluteUrl("/stickers")}`,
    `- Harga: ${absoluteUrl("/pricing")}`,
    `- FAQ: ${absoluteUrl("/faq")}`,
    `- Blog: ${absoluteUrl("/blog")}`,
    "",
    "## Produk dan Harga",
    `- Tag digital Gratis: Rp0, maksimal ${FREE_TAG_LIMIT} tag digital, dengan QR unik, pembaruan data kontak, mode hilang, dan dashboard pengelolaan tag.`,
    `- Printable Single: ${formatPrice(PRINTABLE_SINGLE_PRICE)} untuk 1 lisensi tag QR printable.`,
    `- Printable 5 Tag: ${formatPrice(PRINTABLE_FIVE_PRICE)} untuk 5 lisensi tag QR.`,
    `- Printable 10 Tag: ${formatPrice(PRINTABLE_TEN_PRICE)} untuk 10 lisensi tag QR.`,
    `- Premium: ${formatPrice(PREMIUM_PRICE)}; pilihan fisik berupa gantungan kunci atau stiker QR premium, sesuai ketersediaan.`,
    ...catalogLines,
    `- Detail dan pembelian: ${absoluteUrl("/pricing")} dan ${absoluteUrl("/stickers")}`,
    "",
    "## Cara Kerja",
    ...howItWorksSteps.map(
      (step) => `${step.step}. ${step.title}: ${cleanText(step.description)}`,
    ),
    "",
    "## Privasi, Keamanan, dan Batasan",
    "- Data yang dapat diproses mencakup data akun, data tag, waktu scan, dan perkiraan lokasi scan jika fitur terkait digunakan.",
    "- Nomor WhatsApp tidak dicetak pada tag; halaman publik mengarahkan penemu melalui tombol kontak yang tersedia.",
    "- Lokasi scan bersifat perkiraan dan bukan pelacakan GPS terus-menerus. Tidak semua scan menghasilkan lokasi yang akurat atau tersedia.",
    "- Balikin mengambil langkah yang wajar untuk menjaga keamanan data, tetapi tidak ada sistem yang dapat dijamin bebas risiko 100%.",
    "- Balikin membantu mempertemukan penemu dan pemilik, tetapi tidak menjamin setiap barang hilang akan ditemukan atau dikembalikan.",
    `- Kebijakan privasi: ${absoluteUrl("/privacy-policy")}`,
    `- Syarat layanan: ${absoluteUrl("/terms-of-service")}`,
    "",
    "## Kontak",
    `- Halaman kontak: ${absoluteUrl("/contact")}`,
    "- Email dukungan: support@balikin.online",
    "",
    "## Sumber dan Sitemap",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Cara kerja: ${absoluteUrl("/how-it-works")}`,
    `- Harga: ${absoluteUrl("/pricing")}`,
    `- FAQ: ${absoluteUrl("/faq")}`,
    `- Kebijakan privasi: ${absoluteUrl("/privacy-policy")}`,
    `- Syarat layanan: ${absoluteUrl("/terms-of-service")}`,
    "",
    "## Artikel",
    ...(posts.length > 0
      ? posts.map((post) => {
          const publishedDate = formatDate(post.publishedAt);
          const updatedDate = formatDate(post.updatedAt);
          const dates = [
            publishedDate && `terbit ${publishedDate}`,
            updatedDate && `diperbarui ${updatedDate}`,
          ].filter(Boolean).join(", ");
          const summary = cleanText(post.summary);
          return `- [${cleanText(post.title)}](${absoluteUrl(`/blog/${post.slug}`)}): ${summary}${dates ? ` (${dates})` : ""}`;
        })
      : ["- Belum ada artikel publik yang dapat dimuat saat ini."]),
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
