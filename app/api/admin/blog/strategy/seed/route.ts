import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getWordTarget } from "@/lib/blog-content-strategy";

const APP_ID = "balikin_id";

const seedClusters = [
  { name: "Barang Hilang dan Ditemukan", slug: "barang-hilang-ditemukan", primaryKeyword: "barang hilang", description: "Panduan praktis mencegah, mencari, dan mengembalikan barang hilang." },
  { name: "QR Smart Tag", slug: "qr-smart-tag", primaryKeyword: "qr smart tag", description: "Edukasi tentang QR tag, cara kerja, privasi, dan manfaatnya." },
  { name: "Koper dan Traveling", slug: "koper-traveling", primaryKeyword: "keamanan koper", description: "Konten keamanan barang untuk perjalanan dan aktivitas traveling." },
  { name: "Motor, Mobil, dan Kunci", slug: "otomotif-kunci", primaryKeyword: "keamanan kunci motor", description: "Panduan keamanan kendaraan, kunci, dan aksesori otomotif." },
  { name: "Pelajar dan Anak", slug: "pelajar-anak", primaryKeyword: "keamanan barang anak", description: "Solusi keamanan barang untuk pelajar, anak, dan keluarga." },
  { name: "Hewan Peliharaan", slug: "hewan-peliharaan", primaryKeyword: "identitas hewan peliharaan", description: "Panduan menjaga identitas dan keamanan hewan peliharaan." },
] as const;

const seedArticles = [
  ["Panduan Lengkap Mengatasi Barang Hilang dan Ditemukan", "cara mengatasi barang hilang", "pillar"],
  ["Cara Melacak Barang Hilang dengan Langkah yang Benar", "cara melacak barang hilang", "supporting"],
  ["Apa yang Harus Dilakukan Saat Dompet Hilang?", "dompet hilang", "supporting"],
  ["Cara Meningkatkan Peluang Barang Hilang Kembali", "barang hilang kembali", "supporting"],
  ["Cara Melaporkan Barang Hilang dengan Informasi Lengkap", "lapor barang hilang", "supporting"],
  ["Apa yang Dilakukan Saat Menemukan Barang Orang Lain?", "menemukan barang orang lain", "supporting"],
  ["Cara Membuat Identitas Barang yang Mudah Dihubungi", "identitas barang hilang", "supporting"],
  ["Tips Menyimpan Nomor Seri Barang Berharga", "nomor seri barang", "supporting"],
  ["Checklist Sebelum Meninggalkan Barang di Tempat Umum", "mencegah barang hilang", "supporting"],
  ["Solusi QR Tag untuk Barang yang Sering Hilang", "qr tag barang hilang", "commercial"],
  ["Panduan Lengkap QR Smart Tag untuk Pemula", "qr smart tag untuk pemula", "pillar"],
  ["Apa Itu QR Smart Tag dan Bagaimana Cara Kerjanya?", "apa itu qr smart tag", "supporting"],
  ["Cara Memasang QR Code pada Barang Berharga", "cara memasang qr code", "supporting"],
  ["Apakah QR Smart Tag Aman untuk Privasi?", "keamanan qr smart tag", "supporting"],
  ["Perbedaan QR Smart Tag dan Bluetooth Tracker", "qr smart tag vs bluetooth tracker", "supporting"],
  ["Cara Memilih QR Tag untuk Kebutuhan Keluarga", "memilih qr tag", "supporting"],
  ["QR Code untuk Kunci, Dompet, dan Tas", "qr code untuk barang", "supporting"],
  ["Cara Kerja Notifikasi Saat QR Barang Dipindai", "notifikasi qr barang", "supporting"],
  ["Apakah QR Tag Membutuhkan Aplikasi?", "qr tag tanpa aplikasi", "supporting"],
  ["Beli QR Smart Tag untuk Perlindungan Barang", "beli qr smart tag", "commercial"],
  ["Panduan Lengkap Keamanan Koper Saat Traveling", "keamanan koper saat traveling", "pillar"],
  ["Checklist Keamanan Koper Sebelum Naik Pesawat", "keamanan koper pesawat", "supporting"],
  ["Cara Menandai Koper agar Tidak Tertukar", "cara menandai koper", "supporting"],
  ["Tips Mengamankan Paspor dan Dokumen Saat Traveling", "mengamankan paspor traveling", "supporting"],
  ["Apa yang Dilakukan Saat Koper Hilang di Bandara?", "koper hilang di bandara", "supporting"],
  ["Cara Mengamankan Tas Saat Liburan", "mengamankan tas saat liburan", "supporting"],
  ["Barang yang Wajib Diberi Identitas Saat Traveling", "identitas barang traveling", "supporting"],
  ["Tips Membawa Barang Berharga di Penginapan", "keamanan barang di hotel", "supporting"],
  ["Cara Memilih Tag Koper yang Tahan Lama", "tag koper terbaik", "supporting"],
  ["QR Tag Koper untuk Perjalanan Aman", "qr tag koper", "commercial"],
  ["Panduan Lengkap Keamanan Kunci Motor dan Mobil", "keamanan kunci motor mobil", "pillar"],
  ["Cara Mencegah Kunci Motor Hilang", "mencegah kunci motor hilang", "supporting"],
  ["Apa yang Dilakukan Saat Kunci Mobil Hilang?", "kunci mobil hilang", "supporting"],
  ["Cara Menyimpan Kunci Cadangan dengan Aman", "menyimpan kunci cadangan", "supporting"],
  ["Aksesori Penting untuk Menandai Kunci Kendaraan", "penanda kunci kendaraan", "supporting"],
  ["Tips Keamanan Kendaraan Saat Parkir di Tempat Umum", "keamanan kendaraan parkir", "supporting"],
  ["Cara Menghindari Kunci Motor Tertukar", "kunci motor tertukar", "supporting"],
  ["Mengapa Identitas Kunci Kendaraan Itu Penting?", "identitas kunci kendaraan", "supporting"],
  ["Cara Menyimpan Kunci Kendaraan Saat Bepergian", "menyimpan kunci kendaraan", "supporting"],
  ["Gantungan Kunci QR untuk Motor dan Mobil", "gantungan kunci qr motor", "commercial"],
  ["Panduan Keamanan Barang Pelajar dan Anak", "keamanan barang anak", "pillar"],
  ["Cara Menandai Tas Sekolah agar Tidak Tertukar", "menandai tas sekolah", "supporting"],
  ["Tips Mengamankan Bekal dan Barang Anak di Sekolah", "keamanan barang sekolah", "supporting"],
  ["Cara Mengajarkan Anak Mengembalikan Barang Temuan", "mengajarkan anak barang temuan", "supporting"],
  ["Barang Sekolah yang Sebaiknya Diberi Identitas", "identitas barang sekolah", "supporting"],
  ["Cara Membuat Kontak Darurat pada Barang Anak", "kontak darurat anak", "supporting"],
  ["Tips Mencegah Botol dan Kotak Makan Tertukar", "mencegah barang anak tertukar", "supporting"],
  ["Keamanan Barang Anak Saat Study Tour", "keamanan barang study tour", "supporting"],
  ["Cara Menulis Nama dan Kontak pada Perlengkapan Anak", "menulis kontak barang anak", "supporting"],
  ["QR Tag untuk Tas Sekolah dan Perlengkapan Anak", "qr tag tas sekolah", "commercial"],
  ["Panduan Lengkap Identitas dan Keamanan Hewan Peliharaan", "identitas hewan peliharaan", "pillar"],
  ["Cara Membuat Identitas untuk Kucing yang Hilang", "identitas kucing hilang", "supporting"],
  ["Apa yang Dilakukan Saat Anjing Hilang?", "anjing hilang", "supporting"],
  ["Informasi Penting pada Tag Hewan Peliharaan", "informasi tag hewan", "supporting"],
  ["Cara Menyiapkan Kontak Darurat untuk Hewan", "kontak darurat hewan", "supporting"],
  ["Tips Mencegah Hewan Peliharaan Kabur dari Rumah", "mencegah hewan kabur", "supporting"],
  ["Perbedaan Microchip dan Tag Identitas Hewan", "microchip vs tag hewan", "supporting"],
  ["Cara Memilih Gantungan Identitas Hewan yang Aman", "gantungan identitas hewan", "supporting"],
  ["Checklist Persiapan Hewan Saat Bepergian", "persiapan hewan bepergian", "supporting"],
  ["QR Tag untuk Kalung Hewan Peliharaan", "qr tag hewan peliharaan", "commercial"],
] as const;

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.select({ id: blogContentClusters.id }).from(blogContentClusters);
  if (existing.length > 0) return NextResponse.json({ error: "Content strategy sudah memiliki data." }, { status: 409 });

  const clusters = await db.insert(blogContentClusters).values(seedClusters.map((cluster) => ({
    ...cluster,
    app_id: APP_ID,
    targetArticles: 10,
  }))).returning();

  const plans = [];
  for (let index = 0; index < seedArticles.length; index += 1) {
    const cluster = clusters[Math.floor(index / 10)];
    const [title, focusKeyword, articleType] = seedArticles[index];
    const wordTarget = getWordTarget(articleType);
    plans.push({
      app_id: APP_ID,
      clusterId: cluster.id,
      title,
      focusKeyword,
      articleType,
      targetMinWords: wordTarget.min,
      targetMaxWords: wordTarget.max,
      searchIntent: articleType === "commercial" ? "commercial" : "informational",
      priority: articleType === "pillar" ? "high" : "medium",
      status: "planned",
      brief: `Bahas ${title.toLowerCase()} secara praktis untuk pembaca Indonesia dan arahkan secara natural ke solusi Balikin.`,
      cta: articleType === "commercial" ? "Arahkan ke halaman produk Balikin yang paling relevan." : "Arahkan ke artikel pillar dan satu halaman produk yang relevan.",
    });
  }
  const insertedPlans = await db.insert(blogContentPlans).values(plans).returning();
  for (let index = 0; index < insertedPlans.length; index += 1) {
    if (index % 10 === 0) continue;
    await db.update(blogContentPlans)
      .set({ parentPlanId: insertedPlans[Math.floor(index / 10) * 10].id })
      .where(eq(blogContentPlans.id, insertedPlans[index].id));
  }

  return NextResponse.json({ clusters: clusters.length, plans: plans.length }, { status: 201 });
}
