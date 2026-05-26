import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { WHATSAPP_ORDER_NUMBER } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { contactSections } from "@/lib/site-content";
import { ContactPointJsonLd } from "@/components/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "Kontak Balikin",
  description:
    "Hubungi Balikin untuk pertanyaan produk, pemesanan gantungan kunci QR code, kerja sama komunitas, sekolah, atau kebutuhan corporate.",
  path: "/contact",
  keywords: ["kontak balikin", "pesan gantungan kunci qr code", "hubungi balikin"],
});

export default async function ContactPage() {
  return (
    <MarketingShell
      title="Kontak Balikin"
      description="Untuk pemesanan, pertanyaan fitur, atau kerja sama, Anda bisa menghubungi kami lewat kanal berikut."
    >
      <ContactPointJsonLd
        telephone={`+${WHATSAPP_ORDER_NUMBER}`}
        contactType="Customer Service"
        availableLanguage="Indonesian"
      />
      {contactSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="mb-8 scroll-mt-8"
        >
          <h2 id={`${section.id}-heading`} className="text-xl font-semibold mb-3">
            {section.title}
          </h2>
          {section.type === "contact" && (
            <p className="text-gray-600 leading-relaxed">
              {section.description}{" "}
              <a
                href={`https://wa.me/${WHATSAPP_ORDER_NUMBER}`}
                target="_blank"
                rel="external noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
                aria-label={`Hubungi Balikin via WhatsApp: +${WHATSAPP_ORDER_NUMBER}`}
              >
                +{WHATSAPP_ORDER_NUMBER}
              </a>
            </p>
          )}
          {section.items && (
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {section.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
          {section.content && (
            <p className="text-gray-600 leading-relaxed">{section.content}</p>
          )}
        </section>
      ))}
    </MarketingShell>
  );
}