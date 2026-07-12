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
    }, 3000);

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
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[650px] overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 flex items-center justify-center p-4">
        {/* Blurred logo background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative w-96 h-96 rounded-full overflow-hidden">
            <Image
              src="/balikin_logo.png"
              alt="Balikin Logo Background"
              fill
              className="object-contain"
              quality={90}
            />
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
            }} />
          </div>
        </div>

        <div className="relative w-full h-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', duration: 0.8, ease: 'easeInOut' },
                opacity: { duration: 0.8, ease: 'easeInOut' },
              }}
              className="absolute inset-0"
            >
              <Image
                src={galleryImages[currentIndex].src}
                alt={galleryImages[currentIndex].alt}
                fill
                className="object-contain"
                priority
                quality={90}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
          <motion.button
            onClick={handlePrevious}
            className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-md ml-8 transition-all duration-300"
            aria-label="Previous image"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-8 h-8" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-md mr-8 transition-all duration-300"
            aria-label="Next image"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-8 h-8" />
          </motion.button>
        </div>

        <motion.div
          className="absolute top-8 right-8 z-30 bg-white/20 text-white px-5 py-3 rounded-full text-lg font-semibold backdrop-blur-md border border-white/30"
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {String(currentIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {galleryImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              animate={{
                width: index === currentIndex ? 40 : 12,
                backgroundColor: index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                boxShadow: index === currentIndex ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                scale: 1.1,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="h-3 rounded-full cursor-pointer transition-all"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
