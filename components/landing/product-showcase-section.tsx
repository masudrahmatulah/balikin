'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, Sparkles, QrCode, Lock } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { ImageLightbox, type LightboxImage } from '@/components/landing/image-lightbox';
import { STICKER_COLOR_THEMES, type StickerColorTheme } from '@/lib/sticker-color-themes';

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

const colorShowcaseItems = (Object.keys(STICKER_COLOR_THEMES) as StickerColorTheme[]).map((id) => ({
  id,
  ...STICKER_COLOR_THEMES[id],
}));

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

      <ScrollReveal delay={0.15}>
        <div className="max-w-5xl mx-auto mt-12">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Contoh Pilihan Warna Sticker</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Pilih karakter warna yang paling sesuai dengan barang dan gaya Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {colorShowcaseItems.map((theme) => (
              <div key={theme.id} className="group">
                <div
                  className="relative aspect-[2.25] overflow-hidden rounded-xl p-2.5 shadow-md transition-transform group-hover:-translate-y-1 group-hover:shadow-lg lg:p-3"
                  style={{ backgroundColor: theme.background }}
                >
                  <div className="flex h-full items-center gap-2 lg:gap-2.5">
                    <div className="flex aspect-square h-full shrink-0 items-center justify-center rounded-lg bg-white p-1.5 lg:p-2">
                      <QrCode className="h-full w-full text-gray-950" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3 shrink-0 text-white sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                        <p className="truncate text-[10px] font-black tracking-wide text-white sm:text-xs">PROTECTED</p>
                      </div>
                      <p className="truncate text-[8px] font-black tracking-tight text-white sm:text-[10px]">
                        BY <span style={{ color: theme.accent }}>BALIKIN.ONLINE</span>
                      </p>
                      <p className="mt-1 truncate text-[7px] leading-tight sm:text-[8px]" style={{ color: theme.textMuted }}>
                        If found, please scan to return this item.
                      </p>
                      <p className="truncate text-[7px] leading-tight sm:text-[8px]" style={{ color: theme.textMuted }}>
                        Scan untuk Menghubungi Pemilik Barang
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.accent }}
                    aria-hidden="true"
                  />
                  <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{theme.label}</p>
                </div>
                <p className="mt-0.5 text-center text-xs text-gray-500 dark:text-gray-400">{theme.description}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}
