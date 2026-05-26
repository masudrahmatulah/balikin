import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Check, MessageCircle } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PREMIUM_PRICE, WHATSAPP_ORDER_NUMBER } from "@/lib/constants";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { ProductJsonLd } from "@/components/json-ld";

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

async function PricingPage() {
  'use cache';
  cacheLife('days');

  const offers = pricingPlans.map((plan) => ({
    name: plan.name,
    price: plan.price,
    url: plan.cta.href ? absoluteUrl(plan.cta.href) : absoluteUrl("/sign-up"),
  }));

  return (
    <MarketingShell
      title="Harga Balikin"
      description="Mulai dari tag digital gratis, lalu upgrade ke gantungan kunci QR code premium saat Anda butuh produk fisik."
    >
      <ProductJsonLd
        name="Balikin QR Tag"
        description="Smart Lost & Found QR Tag untuk barang hilang"
        imageUrl={absoluteUrl("/logo-icon.png")}
        offers={offers}
      />

      <section aria-label="Harga paket Balikin" className="not-prose">
        <div className="grid gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-2 ${plan.isPremium ? "border-blue-600" : ""}`}
              role="article"
              aria-labelledby={`plan-${plan.name.toLowerCase()}-title`}
            >
              <CardHeader>
                <CardTitle id={`plan-${plan.name.toLowerCase()}-title`}>
                  {plan.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold" aria-label={`Harga ${plan.price}`}>
                  {plan.price}
                </p>
                <ul
                  className="space-y-3 text-sm text-gray-700"
                  role="list"
                  aria-label={`Fitur ${plan.name}`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2" role="listitem">
                      <Check
                        className="mt-0.5 h-4 w-4"
                        aria-hidden="true"
                        style={{ color: plan.isPremium ? "#2563eb" : "#16a34a" }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.cta.target ? (
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 focus-visible:bg-green-700"
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
                  <Button asChild className="w-full">
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
    </MarketingShell>
  );
}

export default PricingPage;