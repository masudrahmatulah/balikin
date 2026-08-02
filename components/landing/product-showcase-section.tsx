'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { ImageLightbox, type LightboxImage } from '@/components/landing/image-lightbox';

const showcaseItems: LightboxImage[] = [
  { src: '/desains/sticker1.webp', alt: 'Premium Vinyl Sticker' },
  { src: '/satu2/with_bg/bulat.webp', alt: 'Acrylic Tag Bulat' },
  { src: '/satu2/with_bg/oval.webp', alt: 'Acrylic Tag Oval' },
  { src: '/satu2/with_bg/persegi panjang.webp', alt: 'Acrylic Tag Persegi Panjang' },
  { src: '/satu2/with_bg/persegi panjang motif.webp', alt: 'Acrylic Tag Persegi Panjang Motif' },
  { src: '/satu2/with_bg/persegi panjang timbul.webp', alt: 'Acrylic Tag Persegi Panjang Timbul' },
  { src: '/satu2/with_bg/segi delapan.webp', alt: 'Acrylic Tag Segi Delapan' },
  { src: '/satu2/with_bg/hati.webp', alt: 'Acrylic Tag Heart' },
];

export function ProductShowcaseSection() {
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <Badge className="mb-4 bg-indigo-600 text-white hover:bg-indigo-600">
            <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
            Galeri Produk
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Lihat Detail Setiap Produk</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Klik gambar untuk melihat tampilan produk secara close-up sebelum Anda memilih di konfigurator.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {showcaseItems.map((item) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setLightboxImage(item)}
              className="group text-left"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-md shadow-indigo-100/50 cursor-zoom-in transition-transform group-hover:scale-[1.02]">
                <Image src={item.src} alt={item.alt} fill className="object-contain p-5" sizes="(min-width: 1024px) 256px, (min-width: 640px) 33vw, 50vw" />
                <span className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{item.alt}</p>
            </button>
          ))}
        </div>
      </ScrollReveal>

      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}
