'use client';

import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { CampaignForm } from '@/components/campaign-form';
import { Gift } from 'lucide-react';

export function FreePassLeadSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            Balikin Free Pass
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Coba Gratis Selamanya, Tanpa Kartu Kredit
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Masukkan email Anda untuk mendapatkan akses Free Pass dan panduan aktivasi lisensi digital pertama Anda.
          </p>
          <CampaignForm campaignName="homepage-free-pass" campaignTitle="Balikin Free Pass" />
        </div>
      </ScrollReveal>
    </section>
  );
}
