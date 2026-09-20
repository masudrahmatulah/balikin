import type { Metadata } from "next";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PREMIUM_PRICE, WHATSAPP_ORDER_NUMBER } from "@/lib/constants";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { ProductJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = buildMetadata({
  title: "Harga Balikin",
  description:
    "Lihat harga Balikin untuk versi gratis dan premium. Balikin menyediakan QR tag digital gratis dan gantungan kunci QR code premium untuk barang hilang.",
  path: "/pricing",
  keywords: ["harga gantungan kunci qr code", "harga balikin", "tag barang hilang premium"],
});

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  isPremium?: boolean;
  cta: {
    label: string;
    href?: string;
    target?: string;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Gratis",
    price: "Rp0",
    features: [
      "Maksimal 1 tag digital",
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

async function PricingPage() {

  const offers = pricingPlans.map((plan) => ({
    name: plan.name,
    price: plan.price,
    url: plan.cta.href ? absoluteUrl(plan.cta.href) : absoluteUrl("/sign-up"),
  }));

  return (
    <div className="public-content-page min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SiteHeader />
      <header className="bg-gradient-to-r from-brand-navy to-brand-red px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Harga Balikin</h1>
          <p className="text-xl text-red-100">Mulai melindungi barang Anda hari ini</p>
          <p className="mt-4 text-sm text-red-200">Gunakan tag digital gratis atau pilih produk fisik premium sesuai kebutuhan Anda.</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">
      <ProductJsonLd
        name="Balikin QR Tag"
        description="Smart Lost & Found QR Tag untuk barang hilang"
        imageUrl={absoluteUrl("/balikin_logo.webp")}
        offers={offers}
      />

      <section aria-label="Harga paket Balikin" className="not-prose">
        <div className="grid gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
                className={`border-2 bg-white shadow-lg dark:bg-slate-900 ${plan.isPremium ? "border-brand-red shadow-red-900/10" : "border-red-100 dark:border-slate-700"}`}
              role="article"
              aria-labelledby={`plan-${plan.name.toLowerCase()}-title`}
            >
              <CardHeader>
                <CardTitle id={`plan-${plan.name.toLowerCase()}-title`}>
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white" aria-label={`Harga ${plan.price}`}>
                  {plan.price}
                </p>
                <ul
                   className="space-y-3 text-sm text-gray-700 dark:text-slate-300"
                  role="list"
                  aria-label={`Fitur ${plan.name}`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2" role="listitem">
                      <Check
                        className="mt-0.5 h-4 w-4"
                        aria-hidden="true"
                         style={{ color: plan.isPremium ? "#d90f1d" : "#16a34a" }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.cta.target ? (
                  <Button
                    asChild
                     className="w-full bg-brand-red hover:bg-brand-red-dark focus-visible:bg-brand-red-dark"
                  >
                    <a
                      href={plan.cta.href}
                      target="_blank"
                      rel="external noopener noreferrer"
                      aria-label={`${plan.cta.label} untuk paket ${plan.name}`}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                      {plan.cta.label}
                    </a>
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-brand-red hover:bg-brand-red-dark focus-visible:bg-brand-red-dark">
                    <Link
                      href={plan.cta.href || "#"}
                      aria-label={`${plan.cta.label} untuk paket ${plan.name}`}
                    >
                      {plan.cta.label}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
        <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
          © 2026 Balikin.online · Smart Lost &amp; Found Platform Indonesia
        </div>
      </main>
    </div>
  );
}

export default PricingPage;
