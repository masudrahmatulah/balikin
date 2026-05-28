import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { buildMetadata } from "@/lib/seo";
import { termsOfServiceSections } from "@/lib/site-content";
import { WebPageJsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Syarat dan Ketentuan - Balikin",
  description:
    "Syarat dan Ketentuan Balikin mengatur penggunaan aplikasi, kepemilikan tag, batas tanggung jawab, dan aturan penggunaan layanan smart lost & found Balikin.",
  path: "/terms",
  keywords: ["terms balikin", "syarat dan ketentuan balikin"],
});

export default async function TermsPage() {
  return (
    <MarketingShell
      title="Syarat dan Ketentuan"
      description="Dengan menggunakan Balikin, Anda menyetujui syarat penggunaan layanan berikut."
    >
      <WebPageJsonLd
        name="Syarat dan Ketentuan Balikin"
        description="Ketentuan penggunaan layanan smart lost & found Balikin"
        url="/terms"
      />
      {termsOfServiceSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="mb-8 scroll-mt-8"
        >
          <h2 id={`${section.id}-heading`} className="text-xl font-semibold mb-3">
            {section.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">{section.content}</p>
        </section>
      ))}
    </MarketingShell>
  );
}