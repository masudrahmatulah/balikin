'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

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
      <div
        className="relative w-full aspect-video md:aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 flex items-center justify-center p-2 md:p-4"
        style={{ minHeight: '250px', maxHeight: '650px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-white/20 font-extrabold text-5xl md:text-8xl tracking-tight select-none whitespace-nowrap">
            balikin.online
          </span>
        </div>

        <div
          className="relative w-full h-full"
          role="group"
          aria-roledescription="slide"
          aria-label={`Gambar ${currentIndex + 1} dari ${galleryImages.length}`}
        >
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
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
          <motion.button
            onClick={handlePrevious}
            className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-2 md:p-4 rounded-full backdrop-blur-md ml-2 md:ml-8 transition-all duration-300"
            aria-label="Previous image"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-2 md:p-4 rounded-full backdrop-blur-md mr-2 md:mr-8 transition-all duration-300"
            aria-label="Next image"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
          </motion.button>
        </div>

        <motion.div
          className="absolute top-4 md:top-8 right-4 md:right-8 z-30 bg-white/20 text-white px-3 md:px-5 py-2 md:py-3 rounded-full text-sm md:text-lg font-semibold backdrop-blur-md border border-white/30"
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {String(currentIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
        </motion.div>

        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="absolute top-4 md:top-8 left-4 md:left-8 z-30 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all duration-300"
          aria-label={isPaused ? 'Lanjutkan slide otomatis' : 'Jeda slide otomatis'}
        >
          {isPaused ? <Play className="w-4 h-4 md:w-5 md:h-5" /> : <Pause className="w-4 h-4 md:w-5 md:h-5" />}
        </button>

        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
          {galleryImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              animate={{
                width: index === currentIndex ? 30 : 8,
                backgroundColor: index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                boxShadow: index === currentIndex ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                scale: 1.1,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="h-2 md:h-3 rounded-full cursor-pointer transition-all"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
