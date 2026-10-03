import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { SecurityContent } from "./security-content";
import { WebPageJsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Pusat Keamanan & Privasi",
  description: "Penjelasan tentang praktik keamanan data, kontrol akses, dan privasi Balikin.",
  path: "/security",
  keywords: ["security balikin", "keamanan data", "privasi data", "pengelolaan data pribadi"],
});

export default function SecurityPage() {
  return (
    <>
      <WebPageJsonLd
        path="/security"
        name="Pusat Keamanan & Privasi - Balikin"
        description="Penjelasan tentang praktik keamanan data, kontrol akses, dan privasi Balikin."
      />
      <MarketingShell
        title="Pusat Keamanan & Privasi"
        description="Penjelasan tentang bagaimana Balikin membantu melindungi data pengguna melalui kontrol akses, HTTPS, dan kebijakan privasi."
      >
        <SecurityContent />
      </MarketingShell>
    </>
  );
}
