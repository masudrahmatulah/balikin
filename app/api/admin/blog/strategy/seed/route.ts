import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getBrandPillarLabel, getSeedBrandPillar, getWordTarget } from "@/lib/blog-content-strategy";

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

  const insertedClusters = await db.insert(blogContentClusters).values(seedClusters.map((cluster) => ({
    ...cluster,
    app_id: APP_ID,
    targetArticles: 10,
  }))).onConflictDoNothing().returning({ id: blogContentClusters.id });
  const clusters = await db.select().from(blogContentClusters).where(eq(blogContentClusters.app_id, APP_ID));
  const clusterBySlug = new Map(clusters.map((cluster) => [cluster.slug, cluster]));
  const existingPlans = await db.select({
    id: blogContentPlans.id,
    clusterId: blogContentPlans.clusterId,
    title: blogContentPlans.title,
    articleType: blogContentPlans.articleType,
    brandPillar: blogContentPlans.brandPillar,
  }).from(blogContentPlans).where(eq(blogContentPlans.app_id, APP_ID));
  const existingByKey = new Map(existingPlans.map((plan) => [`${plan.clusterId}:${plan.title}`, plan]));
  const seedRows = seedArticles.map(([title, focusKeyword, articleType], index) => {
    const cluster = clusterBySlug.get(seedClusters[Math.floor(index / 10)].slug);
    return { title, focusKeyword, articleType, cluster };
  }).filter((row) => row.cluster);

  const newPlans = [];
  let plansLabeled = 0;
  for (const row of seedRows) {
    const cluster = row.cluster!;
    const key = `${cluster.id}:${row.title}`;
    const existingPlan = existingByKey.get(key);
    if (existingPlan) {
      if (!existingPlan.brandPillar) {
        await db.update(blogContentPlans)
          .set({ brandPillar: getSeedBrandPillar(row.title, row.focusKeyword, row.articleType) })
          .where(and(eq(blogContentPlans.id, existingPlan.id), eq(blogContentPlans.app_id, APP_ID)));
        plansLabeled += 1;
      }
      continue;
    }

    const wordTarget = getWordTarget(row.articleType);
    newPlans.push({
      app_id: APP_ID,
      clusterId: cluster.id,
      title: row.title,
      focusKeyword: row.focusKeyword,
      articleType: row.articleType,
      brandPillar: getSeedBrandPillar(row.title, row.focusKeyword, row.articleType),
      targetMinWords: wordTarget.min,
      targetMaxWords: wordTarget.max,
      searchIntent: row.articleType === "commercial" ? "commercial" : "informational",
      priority: row.articleType === "pillar" ? "high" : "medium",
      status: "planned",
      brief: `Bahas ${row.title.toLowerCase()} secara praktis untuk pembaca Indonesia. Bangun tema brand “${getBrandPillarLabel(getSeedBrandPillar(row.title, row.focusKeyword, row.articleType))}” dengan nada hangat, jelas, dan tidak menggurui; arahkan secara natural ke solusi Balikin jika relevan.`,
      cta: row.articleType === "commercial" ? "Arahkan ke halaman produk Balikin yang paling relevan." : "Arahkan ke artikel pillar dan satu halaman produk yang relevan.",
    });
  }

  const insertedPlans = newPlans.length ? await db.insert(blogContentPlans).values(newPlans).returning() : [];
  const rootPlanByCluster = new Map<string, string>();
  for (const row of seedRows) {
    if (row.articleType !== "pillar" || !row.cluster) continue;
    const key = `${row.cluster.id}:${row.title}`;
    const existingRoot = existingByKey.get(key);
    const insertedRoot = insertedPlans.find((plan) => plan.clusterId === row.cluster!.id && plan.title === row.title);
    const rootId = existingRoot?.id || insertedRoot?.id;
    if (rootId) rootPlanByCluster.set(row.cluster.id, rootId);
  }
  for (const plan of insertedPlans) {
    const parentPlanId = rootPlanByCluster.get(plan.clusterId);
    if (!parentPlanId || plan.articleType === "pillar") continue;
    await db.update(blogContentPlans)
      .set({ parentPlanId })
      .where(and(
        eq(blogContentPlans.id, plan.id),
        eq(blogContentPlans.app_id, APP_ID),
      ));
  }

  return NextResponse.json({
    clustersAdded: insertedClusters.length,
    plansAdded: insertedPlans.length,
    plansLabeled,
    totalSeedPlans: seedRows.length,
  }, { status: insertedClusters.length || insertedPlans.length || plansLabeled ? 201 : 200 });
}
