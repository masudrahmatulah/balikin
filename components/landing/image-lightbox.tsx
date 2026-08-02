'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export type LightboxImage = { src: string; alt: string };

export function ImageLightbox({ image, onClose }: { image: LightboxImage | null; onClose: () => void }) {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[85vh] max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute -top-3 -right-3 z-10 rounded-full bg-white text-gray-900 p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-2xl">
              <Image src={image.src} alt={image.alt} fill className="object-contain p-6" sizes="(min-width: 768px) 768px, 100vw" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
