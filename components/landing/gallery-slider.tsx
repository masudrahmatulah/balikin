'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export function GallerySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden bg-white">
        <div className="relative w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 100, damping: 40, mass: 1.5, duration: 1.2 },
                opacity: { duration: 1, ease: 'easeInOut' },
                scale: { duration: 1, ease: 'easeInOut' },
              }}
              className="w-full"
            >
              <Image
                src={galleryImages[currentIndex].src}
                alt={galleryImages[currentIndex].alt}
                width={800}
                height={1000}
                className="w-full h-auto block"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Overlay on Image */}
        <div className="absolute inset-0 top-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20" style={{ height: '100%' }}>
          <motion.button
            onClick={handlePrevious}
            className="pointer-events-auto bg-gray-900/50 hover:bg-gray-900/70 text-white p-3 rounded-full backdrop-blur-sm ml-4 transition-colors"
            aria-label="Previous image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="pointer-events-auto bg-gray-900/50 hover:bg-gray-900/70 text-white p-3 rounded-full backdrop-blur-sm mr-4 transition-colors"
            aria-label="Next image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Counter */}
        <motion.div
          className="absolute top-4 right-4 z-30 bg-gray-900/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
          key={currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {currentIndex + 1} / {galleryImages.length}
        </motion.div>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {galleryImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              animate={{
                width: index === currentIndex ? 32 : 8,
                backgroundColor: index === currentIndex ? 'rgba(17,24,39,1)' : 'rgba(107,114,128,0.6)',
              }}
              whileHover={{
                backgroundColor: 'rgba(55,65,81,1)',
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="h-2 rounded-full"
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
