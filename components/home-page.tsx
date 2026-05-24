'use client';

import { SiteHeader } from '@/components/site-header';
import { FlashSaleBanner } from '@/components/landing/urgency-badge';
import { HeroSection } from '@/components/landing/hero-section';
import { PainPointsSection } from '@/components/landing/pain-points-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ScenariosSection } from '@/components/landing/scenarios-section';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { StoryTimelineSection } from '@/components/landing/story-timeline-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { BundleDeals } from '@/components/landing/bundle-deals';
import { PricingSection } from '@/components/landing/pricing-section';
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

      {/* Product Showcase Section */}
      <ProductShowcase />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Before/After Story Section */}
      <StoryTimelineSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Bundle Deals Section */}
      <BundleDeals />

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA & More Testimonials */}
      <FinalCTASection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}