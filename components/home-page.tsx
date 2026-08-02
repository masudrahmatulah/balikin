'use client';

import { SiteHeader } from '@/components/site-header';
import { SmartLicenseHeroSection } from '@/components/landing/smart-license-hero-section';
import { LicenseConfiguratorSection } from '@/components/landing/license-configurator-section';
import { ProductShowcaseSection } from '@/components/landing/product-showcase-section';
import { QrScanSimulatorSection } from '@/components/landing/qr-scan-simulator-section';
import { WhyBuyComparisonSection } from '@/components/landing/why-buy-comparison-section';
import { GallerySlider } from '@/components/landing/gallery-slider';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { B2bScalabilitySection } from '@/components/landing/b2b-scalability-section';
import { TrustSecuritySection } from '@/components/landing/trust-security-section';
import { FreePassLeadSection } from '@/components/landing/free-pass-lead-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FooterSection } from '@/components/landing/footer-section';

export function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header - Auth-Aware Navigation */}
      <SiteHeader />

      {/* Hero: Balikin Smart License positioning */}
      <SmartLicenseHeroSection />

      {/* Gallery slider */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <GallerySlider />
      </section>

      {/* Product showcase gallery: detailed large images of every product variant */}
      <ProductShowcaseSection />

      {/* Interactive configurator: material/shape/design add-ons with live price */}
      <LicenseConfiguratorSection />

      {/* QR scan simulator: anonymous WhatsApp flow education */}
      <QrScanSimulatorSection />

      {/* Why buy: logical comparison vs Bluetooth tracker & writing phone number on items */}
      <WhyBuyComparisonSection />

      {/* Social proof: testimonials + Verified Owner Badge teaser */}
      <SocialProofSection />

      {/* B2B scalability: government, schools, communities */}
      <B2bScalabilitySection />

      {/* Trust & Security Section */}
      <TrustSecuritySection />

      {/* Free Pass lead capture */}
      <FreePassLeadSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
