import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tentang Balikin",
  description:
    "Pelajari tentang Balikin, misi smart lost & found berbasis QR code, dan alasan produk ini dibuat untuk membantu barang hilang kembali ke pemilik.",
  path: "/about",
  keywords: ["tentang balikin", "about balikin", "smart lost and found indonesia"],
});

export default function AboutPage() {
  return (
    <MarketingShell
      title="Tentang Balikin"
      description="Balikin dibuat untuk memudahkan orang baik mengembalikan barang yang ditemukan tanpa mengorbankan privasi pemilik."
    >
      <p>
        Balikin adalah aplikasi smart lost &amp; found yang menghubungkan produk
        fisik seperti gantungan kunci atau stiker QR dengan profil digital yang
        bisa diperbarui kapan saja.
      </p>
      <p>
        Banyak barang hilang sebenarnya ditemukan orang lain, tetapi penemu
        tidak tahu bagaimana cara menghubungi pemilik dengan aman. Menuliskan
        nama dan nomor WhatsApp langsung di barang juga menimbulkan risiko
        privasi.
      </p>
      <h2>Misi</h2>
      <p>
        Misi Balikin adalah membuat proses mengembalikan barang menjadi lebih
        mudah, lebih aman, dan lebih cepat. Pemilik mendapatkan rasa tenang,
        sementara penemu mendapatkan cara yang jelas untuk berbuat baik.
      </p>
      <h2>Bagaimana Balikin Bekerja</h2>
      <p>
        Setiap tag memiliki QR code dinamis. Saat di-scan, sistem menampilkan
        halaman publik sesuai status barang. Jika barang hilang, pemilik dapat
        mengaktifkan mode hilang agar penemu segera melihat cara menghubungi
        pemilik.
      </p>
      <h2>Kenapa Balikin Berbeda</h2>
      <ul>
        <li>Privasi lebih aman karena nomor tidak dicetak terbuka di barang.</li>
        <li>Data kontak dapat diperbarui tanpa mengganti QR code.</li>
        <li>Tersedia versi gratis dan versi produk fisik premium.</li>
      </ul>
    </MarketingShell>
  );
}
