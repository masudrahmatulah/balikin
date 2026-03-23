import type { Metadata } from "next";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PREMIUM_PRICE, WHATSAPP_ORDER_NUMBER } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Harga Balikin",
  description:
    "Lihat harga Balikin untuk versi gratis dan premium. Balikin menyediakan QR tag digital gratis dan gantungan kunci QR code premium untuk barang hilang.",
  path: "/pricing",
  keywords: ["harga gantungan kunci qr code", "harga balikin", "tag barang hilang premium"],
});

export default function PricingPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=Halo%2C%20saya%20ingin%20pesan%20Balikin%20Premium`;

  return (
    <MarketingShell
      title="Harga Balikin"
      description="Mulai dari tag digital gratis, lalu upgrade ke gantungan kunci QR code premium saat Anda butuh produk fisik."
    >
      <div className="not-prose grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Gratis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">Rp0</p>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                "Maksimal 2 tag digital",
                "QR code unik",
                "Update data kontak real-time",
                "Mode hilang",
                "Dashboard pengelolaan tag",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link href="/sign-up">Mulai Gratis</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-600">
          <CardHeader>
            <CardTitle>Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">Rp{PREMIUM_PRICE.toLocaleString("id-ID")}</p>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                "Semua fitur gratis",
                "Gantungan kunci atau stiker QR code premium",
                "Verified owner badge",
                "Material lebih tahan lama",
                "Cocok untuk hadiah, keluarga, dan komunitas",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-blue-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Pesan via WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
