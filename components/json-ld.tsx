import Script from "next/script";

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
}

export function WebPageJsonLd({ name, description }: WebPageJsonLdProps) {
  return (
    <JsonLd
      id="webpage-schema"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
      }}
    />
  );
}

interface Offer {
  name: string;
  price: string;
  url: string;
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  imageUrl: string;
  offers: Offer[];
}

export function ProductJsonLd({ name, description, imageUrl, offers }: ProductJsonLdProps) {
  return (
    <JsonLd
      id="product-schema"
      data={{
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name,
        description,
        image: imageUrl,
        offers: offers.map((offer) => ({
          '@type': 'Offer',
          name: offer.name,
          price: offer.price.replace(/[^0-9]/g, ''),
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          url: offer.url,
          offeredBy: {
            '@type': 'Organization',
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
  telephone: string;
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
        telephone,
        contactType,
        areaServed,
        availableLanguage,
      }}
    />
  );
}