import type { Metadata } from "next";
import Link from "next/link";
import { Check, MessageCircle, ArrowLeft } from "lucide-react";
import { PREMIUM_PRICE, WHATSAPP_ORDER_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Harga Balikin",
  description: "Lihat harga Balikin untuk versi gratis dan premium.",
};

const pricingPlans = [
  {
    name: "Gratis",
    price: "Rp0",
    features: [
      "Maksimal 2 tag digital",
      "QR code unik",
      "Update data kontak real-time",
      "Mode hilang",
      "Dashboard pengelolaan tag",
    ],
    cta: {
      label: "Mulai Gratis",
      href: "/sign-up",
    },
  },
  {
    name: "Premium",
    price: `Rp${PREMIUM_PRICE.toLocaleString("id-ID")}`,
    features: [
      "Semua fitur gratis",
      "Gantungan kunci atau stiker QR code premium",
      "Verified owner badge",
      "Material lebih tahan lama",
      "Cocok untuk hadiah, keluarga, dan komunitas",
    ],
    isPremium: true,
    cta: {
      label: "Pesan via WhatsApp",
      href: `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=Halo%2C%20saya%20ingin%20pesan%20Balikin%20Premium`,
      target: "_blank",
    },
  },
];

export default function MobilePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Harga Balikin</h1>
          <p className="text-sm text-gray-600">
            Mulai dari tag digital gratis, lalu upgrade ke gantungan kunci QR code premium.
          </p>
        </div>

        {pricingPlans.map((plan, index) => (
          <div
            key={plan.name}
            className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border ${
              plan.isPremium ? "border-mobile-primary" : "border-white/20"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              {plan.isPremium && (
                <span className="bg-mobile-primary-lighter text-mobile-primary text-xs font-semibold px-3 py-1 rounded-full">
                  POPULER
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-6">{plan.price}</p>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    plan.isPremium ? 'bg-mobile-primary' : 'bg-mobile-success'
                  }`}>
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.cta.target ? (
              <a
                href={plan.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-mobile-success text-white py-3 rounded-xl text-center font-semibold btn-press"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {plan.cta.label}
                </div>
              </a>
            ) : (
              <Link
                href={plan.cta.href || "#"}
                className="block w-full bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press"
              >
                {plan.cta.label}
              </Link>
            )}
          </div>
        ))}

        <div className="bg-mobile-info-lighter border border-mobile-info-lighter rounded-2xl p-4">
          <p className="text-sm text-mobile-info">
            💡 Semua pesanan premium diproses melalui WhatsApp untuk memastikan keamanan dan kenyamanan transaksi.
          </p>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}
