import { absoluteUrl } from "@/lib/seo";

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

interface SiteGraphJsonLdProps {
  path: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export function SiteGraphJsonLd({
  path,
  name,
  description,
  imageUrl,
}: SiteGraphJsonLdProps) {
  const pageUrl = absoluteUrl(path);
  const pageId = `${pageUrl}#webpage`;

  return (
    <JsonLd
      id={`site-graph-${path === "/" ? "home" : path.replace(/[^a-z0-9]+/gi, "-")}`}
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": organizationId,
            name: "Balikin",
            alternateName: "Balikin Smart Tag",
            url: absoluteUrl("/"),
            description:
              "Platform smart lost and found Indonesia berbasis QR code untuk membantu barang hilang kembali ke pemilik.",
            logo: {
              "@type": "ImageObject",
              "@id": absoluteUrl("/#logo"),
              url: absoluteUrl("/balikin_logo.webp"),
            },
            sameAs: ["https://instagram.com/balikin.online"],
          },
          {
            "@type": "WebSite",
            "@id": websiteId,
            url: absoluteUrl("/"),
            name: "Balikin",
            publisher: { "@id": organizationId },
            inLanguage: "id-ID",
          },
          {
            "@type": "WebPage",
            "@id": pageId,
            url: pageUrl,
            name,
            description,
            isPartOf: { "@id": websiteId },
            about: { "@id": organizationId },
            publisher: { "@id": organizationId },
            inLanguage: "id-ID",
            ...(imageUrl && {
              primaryImageOfPage: {
                "@type": "ImageObject",
                "@id": `${pageId}#primaryimage`,
                url: imageUrl,
              },
            }),
          },
        ],
      }}
    />
  );
}

interface FAQPageJsonLdProps {
  questions: Array<{ question: string; answer: string }>;
}

export function FAQPageJsonLd({ questions }: FAQPageJsonLdProps) {
  return (
    <JsonLd
      id="faq-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  );
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}

export function HowToJsonLd({ name, description, steps }: HowToJsonLdProps) {
  return (
    <JsonLd
      id="howto-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        step: steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }}
    />
  );
}

interface WebPageJsonLdProps {
  name: string;
  description: string;
  path?: string;
}

export function WebPageJsonLd({ name, description, path = "/" }: WebPageJsonLdProps) {
  const pageUrl = absoluteUrl(path);

  return (
    <JsonLd
      id="webpage-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        description,
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        publisher: { '@id': organizationId },
        inLanguage: 'id-ID',
      }}
    />
  );
}

interface Offer {
  name: string;
  price: string | number;
  url: string;
  availability?: string;
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  imageUrl: string;
  offers: Offer[];
  productId?: string;
  id?: string;
}

export function ProductJsonLd({
  name,
  description,
  imageUrl,
  offers,
  productId,
  id = 'product-schema',
}: ProductJsonLdProps) {
  return (
    <JsonLd
      id={id}
      data={{
        '@context': 'https://schema.org/',
        '@type': 'Product',
        ...(productId && { '@id': productId }),
        name,
        description,
        image: imageUrl,
        brand: {
          '@type': 'Brand',
          name: 'Balikin',
        },
        offers: offers.map((offer) => ({
          '@type': 'Offer',
          name: offer.name,
          price: typeof offer.price === 'number' ? offer.price : offer.price.replace(/[^0-9]/g, ''),
          priceCurrency: 'IDR',
          url: offer.url,
          ...(offer.availability && { availability: offer.availability }),
          offeredBy: {
            '@type': 'Organization',
            '@id': organizationId,
            name: 'Balikin',
          },
        })),
      }}
    />
  );
}

interface PersonJsonLdProps {
  name: string;
  description?: string;
  email?: string;
  telephone?: string;
  url?: string;
  jobTitle?: string;
  worksFor?: string;
}

export function PersonJsonLd({
  name,
  description,
  email,
  telephone,
  url,
  jobTitle,
  worksFor,
}: PersonJsonLdProps) {
  return (
    <JsonLd
      id="person-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        ...(description && { description }),
        ...(email && { email }),
        ...(telephone && { telephone }),
        ...(url && { url }),
        ...(jobTitle && { jobTitle }),
        ...(worksFor && {
          worksFor: {
            '@type': 'Organization',
            name: worksFor,
          },
        }),
      }}
    />
  );
}

interface ContactPointJsonLdProps {
  telephone?: string;
  contactType?: string;
  areaServed?: string;
  availableLanguage?: string;
}

export function ContactPointJsonLd({
  telephone,
  contactType = 'Customer Service',
  areaServed = 'ID',
  availableLanguage = 'Indonesian',
}: ContactPointJsonLdProps) {
  return (
    <JsonLd
      id="contactpoint-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'ContactPoint',
        ...(telephone && !/^\+?62(?:XXX|81234567890)$/.test(telephone) && { telephone }),
        contactType,
        areaServed,
        availableLanguage,
      }}
    />
  );
}

interface OrganizationJsonLdProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export function OrganizationJsonLd({
  name = 'Balikin',
  description = 'Platform smart lost and found Indonesia dengan teknologi QR Smart Tag untuk melindungi barang berharga Anda.',
  url = absoluteUrl('/'),
  logo = absoluteUrl('/balikin_logo.webp'),
  sameAs = ['https://instagram.com/balikin.online'],
}: OrganizationJsonLdProps) {
  return (
    <JsonLd
      id="organization-schema"
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name,
            description,
            url,
            logo,
            sameAs,
          },
          {
            '@type': 'WebSite',
            '@id': websiteId,
            url: absoluteUrl('/'),
            name,
            publisher: { '@id': organizationId },
            inLanguage: 'id-ID',
          },
        ],
      }}
    />
  );
}
