import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cara Kerja Balikin",
  description:
    "Pelajari cara kerja Balikin dari pembuatan tag QR code, aktivasi mode hilang, hingga proses penemu menghubungi pemilik lewat WhatsApp.",
  path: "/how-it-works",
  keywords: ["cara kerja qr code barang hilang", "cara kerja balikin", "lost and found qr code"],
});

export default function HowItWorksPage() {
  return (
    <MarketingShell
      title="Cara Kerja Balikin"
      description="Balikin dirancang agar mudah dipakai pemilik barang dan mudah dipahami oleh penemu."
    >
      <h2>1. Buat Tag</h2>
      <p>
        Daftar akun, buat tag untuk kunci, tas, dompet, koper, atau barang
        pribadi lainnya. Sistem akan menghasilkan QR code unik yang terhubung ke
        halaman publik tag Anda.
      </p>
      <h2>2. Tempel atau Pasang</h2>
      <p>
        Gunakan QR code digital atau upgrade ke gantungan kunci atau stiker
        premium. QR yang sama tetap bisa dipakai walaupun Anda mengganti nomor
        WhatsApp atau pesan yang ditampilkan.
      </p>
      <h2>3. Aktifkan Saat Dibutuhkan</h2>
      <p>
        Dari dashboard, Anda bisa mengubah status barang menjadi normal atau
        hilang. Saat mode hilang aktif, halaman publik akan menampilkan tampilan
        yang lebih menonjol agar penemu segera tahu bahwa barang sedang dicari.
      </p>
      <h2>4. Penemu Scan dan Menghubungi Pemilik</h2>
      <p>
        Penemu cukup scan QR code dengan kamera ponsel. Mereka akan melihat
        halaman yang mengarahkan ke WhatsApp pemilik tanpa perlu melihat nomor
        yang tercetak secara terbuka.
      </p>
    </MarketingShell>
  );
}
