import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Kebijakan Privasi Balikin menjelaskan data apa yang dikumpulkan, bagaimana data digunakan, dan bagaimana privasi pengguna dijaga dalam layanan smart lost & found Balikin.",
  path: "/privacy-policy",
  keywords: ["privacy policy balikin", "kebijakan privasi balikin"],
});

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell
      title="Kebijakan Privasi"
      description="Dokumen ini menjelaskan bagaimana Balikin mengumpulkan, menggunakan, dan melindungi data pengguna."
    >
      <h2>Data yang Kami Kumpulkan</h2>
      <p>
        Balikin dapat memproses data akun seperti nomor WhatsApp, email, data
        tag, pesan khusus, serta informasi aktivitas seperti waktu scan dan
        perkiraan lokasi scan jika fitur terkait diaktifkan.
      </p>
      <h2>Tujuan Penggunaan Data</h2>
      <ul>
        <li>Menyediakan layanan smart lost &amp; found.</li>
        <li>Menghubungkan penemu barang dengan pemilik secara aman.</li>
        <li>Mengelola autentikasi, dashboard, dan status tag.</li>
        <li>Meningkatkan keamanan dan keandalan layanan.</li>
      </ul>
      <h2>Privasi Kontak</h2>
      <p>
        Balikin berupaya mengurangi eksposur nomor kontak dengan tidak
        menampilkannya secara terbuka pada media fisik. Kontak diarahkan melalui
        tombol aksi yang relevan.
      </p>
      <h2>Penyimpanan dan Keamanan</h2>
      <p>
        Kami mengambil langkah yang wajar untuk menjaga keamanan data. Namun,
        tidak ada sistem yang dapat dijamin 100% bebas risiko.
      </p>
    </MarketingShell>
  );
}
