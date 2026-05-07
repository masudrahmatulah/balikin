import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { SecurityContent } from "./security-content";

export const metadata: Metadata = buildMetadata({
  title: "Pusat Keamanan & Privasi",
  description: "Transparansi penuh tentang keamanan data, enkripsi, dan kepatuhan regulasi Balikin.",
  path: "/security",
  keywords: ["security balikin", "keamanan data", "kepatuhan regulasi", "UU PDP", "SOC2", "ISO 27001"],
});

export default function SecurityPage() {
  return (
    <MarketingShell
      title="Pusat Keamanan & Privasi"
      description="Transparansi penuh tentang bagaimana kami melindungi data Anda dengan standar keamanan kelas dunia."
    >
      <SecurityContent />
    </MarketingShell>
  );
}
