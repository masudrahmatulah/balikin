import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { WHATSAPP_ORDER_NUMBER } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kontak Balikin",
  description:
    "Hubungi Balikin untuk pertanyaan produk, pemesanan gantungan kunci QR code, kerja sama komunitas, sekolah, atau kebutuhan corporate.",
  path: "/contact",
  keywords: ["kontak balikin", "pesan gantungan kunci qr code", "hubungi balikin"],
});

export default function ContactPage() {
  return (
    <MarketingShell
      title="Kontak Balikin"
      description="Untuk pemesanan, pertanyaan fitur, atau kerja sama, Anda bisa menghubungi kami lewat kanal berikut."
    >
      <h2>WhatsApp</h2>
      <p>
        Pemesanan paling cepat bisa dilakukan lewat WhatsApp:
        {" "}
        <a
          href={`https://wa.me/${WHATSAPP_ORDER_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          +{WHATSAPP_ORDER_NUMBER}
        </a>
      </p>
      <h2>Kebutuhan yang Bisa Dibantu</h2>
      <ul>
        <li>Pemesanan gantungan kunci atau stiker QR code premium.</li>
        <li>Paket keluarga, sekolah, komunitas, dan corporate.</li>
        <li>Pertanyaan seputar privasi, aktivasi, atau upgrade tag.</li>
      </ul>
      <h2>Jam Respons</h2>
      <p>
        Kami mengupayakan respons secepat mungkin pada jam kerja. Untuk kebutuhan
        pemesanan, sertakan nama, jumlah tag, dan tujuan penggunaan agar proses
        lebih cepat.
      </p>
    </MarketingShell>
  );
}
