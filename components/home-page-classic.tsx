'use client';

import { SiteHeader } from '@/components/site-header';
import { FlashSaleBanner } from '@/components/landing/urgency-badge';
import { HeroSection } from '@/components/landing/hero-section';
import { PainPointsSection } from '@/components/landing/pain-points-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ScenariosSection } from '@/components/landing/scenarios-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { PricingSection } from '@/components/landing/pricing-section';
import { FreeVsPremiumComparison } from '@/components/landing/free-vs-premium-comparison';
import { BundleDeals } from '@/components/landing/bundle-deals';
import { TrustSecuritySection } from '@/components/landing/trust-security-section';
import { FinalCTASection } from '@/components/landing/final-cta-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FooterSection } from '@/components/landing/footer-section';

export function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Flash Sale Banner - Urgency */}
      <FlashSaleBanner />

      {/* Header - Auth-Aware Navigation */}
      <SiteHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Pain Points Section */}
      <PainPointsSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Cara Kerja Section */}
      <HowItWorksSection />

      {/* Use Cases / Scenarios Section */}
      <ScenariosSection />

      {/* Benefits Section - MOVED HERE: Audience understands technology value before pricing */}
      <BenefitsSection />

      {/* Product Showcase Section */}
      <ProductShowcase />

      {/* Pricing Section */}
      <PricingSection />

      {/* Free vs Premium Comparison */}
      <FreeVsPremiumComparison />

      {/* Bundle Deals Section */}
      <BundleDeals />

      {/* Trust & Security Section */}
      <TrustSecuritySection />

      {/* Final CTA & More Testimonials */}
      <FinalCTASection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}