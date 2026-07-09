'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryImages = [
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp',
    alt: 'Balikin Gallery 1',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (2).webp',
    alt: 'Balikin Gallery 2',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (3).webp',
    alt: 'Balikin Gallery 3',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (4).webp',
    alt: 'Balikin Gallery 4',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (5).webp',
    alt: 'Balikin Gallery 5',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (6).webp',
    alt: 'Balikin Gallery 6',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (7).webp',
    alt: 'Balikin Gallery 7',
  },
  {
    src: '/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (8).webp',
    alt: 'Balikin Gallery 8',
  },
];

export function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  };

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Galeri Balikin Smart Tag
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lihat bagaimana Balikin Smart Tag bekerja dan digunakan oleh ribuan pengguna di seluruh Indonesia
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative w-full aspect-video">
              <Image
                src={galleryImages[selectedIndex].src}
                alt={galleryImages[selectedIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <span className="text-white text-sm">
                {selectedIndex + 1} / {galleryImages.length}
              </span>

              <button
                onClick={handleNext}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
