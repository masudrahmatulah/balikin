import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { privacyPolicySections } from "@/lib/site-content";
import { WebPageJsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Kebijakan Privasi Balikin menjelaskan data apa yang dikumpulkan, bagaimana data digunakan, dan bagaimana privasi pengguna dijaga dalam layanan smart lost & found Balikin.",
  path: "/privacy-policy",
  keywords: ["privacy policy balikin", "kebijakan privasi balikin"],
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <WebPageJsonLd
        name="Kebijakan Privasi - Balikin"
        description="Kebijakan privasi Balikin untuk layanan smart lost & found"
      />
      <MarketingShell
        title="Kebijakan Privasi"
        description="Dokumen ini menjelaskan bagaimana Balikin mengumpulkan, menggunakan, dan melindungi data pengguna."
      >
        <section aria-labelledby="data-collection">
          <h2 id="data-collection" className="scroll-mt-8">
            Data yang Kami Kumpulkan
          </h2>
          <p>
            Balikin dapat memproses data akun seperti nomor WhatsApp, email, data
            tag, pesan khusus, serta informasi aktivitas seperti waktu scan dan
            perkiraan lokasi scan jika fitur terkait diaktifkan.
          </p>
        </section>

        <section aria-labelledby="data-usage">
          <h2 id="data-usage" className="scroll-mt-8">
            Tujuan Penggunaan Data
          </h2>
          <ul>
            <li>Menyediakan layanan smart lost &amp; found.</li>
            <li>Menghubungkan penemu barang dengan pemilik secara aman.</li>
            <li>Mengelola autentikasi, dashboard, dan status tag.</li>
            <li>Meningkatkan keamanan dan keandalan layanan.</li>
          </ul>
        </section>

        <section aria-labelledby="contact-privacy">
          <h2 id="contact-privacy" className="scroll-mt-8">
            Privasi Kontak
          </h2>
          <p>
            Balikin berupaya mengurangi eksposur nomor kontak dengan tidak
            menampilkannya secara terbuka pada media fisik. Kontak diarahkan melalui
            tombol aksi yang relevan.
          </p>
        </section>

        <section aria-labelledby="data-security">
          <h2 id="data-security" className="scroll-mt-8">
            Penyimpanan dan Keamanan
          </h2>
          <p>
            Kami mengambil langkah yang wajar untuk menjaga keamanan data. Namun,
            tidak ada sistem yang dapat dijamin 100% bebas risiko.
          </p>
        </section>
      </MarketingShell>
    </>
  );
}