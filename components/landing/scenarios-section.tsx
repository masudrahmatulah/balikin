'use client';

import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { ScenarioCard, scenarios } from '@/components/landing/scenario-card';

export function ScenariosSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cocok Buat Siapa Saja!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Apapun gaya hidupmu, Balikin punya solusi untuk proteksi barang berharga.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((scenario, index) => (
            <ScenarioCard key={index} scenario={scenario} index={index} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}