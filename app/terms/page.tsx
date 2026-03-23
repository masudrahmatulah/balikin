import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Syarat dan Ketentuan Balikin mengatur penggunaan aplikasi, kepemilikan tag, batas tanggung jawab, dan aturan penggunaan layanan smart lost & found Balikin.",
  path: "/terms",
  keywords: ["terms balikin", "syarat dan ketentuan balikin"],
});

export default function TermsPage() {
  return (
    <MarketingShell
      title="Syarat dan Ketentuan"
      description="Dengan menggunakan Balikin, Anda menyetujui syarat penggunaan layanan berikut."
    >
      <h2>Penggunaan Layanan</h2>
      <p>
        Balikin disediakan untuk membantu pemilik barang mengelola tag QR code
        dan membantu penemu menghubungi pemilik. Pengguna bertanggung jawab atas
        data yang mereka masukkan ke dalam sistem.
      </p>
      <h2>Kepemilikan Tag</h2>
      <p>
        Tag yang belum diklaim dapat dihubungkan ke akun pengguna pertama yang
        melakukan proses klaim sesuai alur sistem yang berlaku.
      </p>
      <h2>Batas Tanggung Jawab</h2>
      <p>
        Balikin membantu mempertemukan penemu dan pemilik, tetapi tidak dapat
        menjamin bahwa setiap barang yang hilang akan kembali.
      </p>
      <h2>Penyalahgunaan</h2>
      <p>
        Pengguna dilarang memakai layanan untuk penipuan, pelanggaran privasi,
        atau aktivitas yang melanggar hukum.
      </p>
    </MarketingShell>
  );
}
