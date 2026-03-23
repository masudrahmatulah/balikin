'use client';

import { Card } from '@/components/ui/card';
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Testimonial {
  name: string;
  avatar?: string;
  role: string;
  content: string;
  rating: number;
  location?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full p-6 hover-card-effect border-gray-200">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-gray-700 mb-6 relative">
          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-100 opacity-50" />
          <span className="relative">{testimonial.content}</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{testimonial.name}</p>
            <p className="text-sm text-gray-500">{testimonial.role}</p>
            {testimonial.location && (
              <p className="text-xs text-gray-400">{testimonial.location}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Sample testimonials data
export const testimonials: Testimonial[] = [
  {
    name: 'Sarah Putri',
    role: 'Ibu Rumah Tangga',
    content: 'Anak saya sering lupa taruh kunci motor. Berkat Balikin, setiap kali kucingnya ketemu orang lain, selalu bisa balik lagi. Lega banget!',
    rating: 5,
    location: 'Jakarta Selatan',
  },
  {
    name: 'Budi Santoso',
    role: 'Mahasiswa',
    content: 'Pernah dompet ilang di kampus untung ada QR Balikin. Penemunya langsung WA dan bisa ketemu lagi. Fitur lost mode-nya very helpful!',
    rating: 5,
    location: 'Bandung',
  },
  {
    name: 'Rina Wijaya',
    role: 'Wiraswasta',
    content: 'Saya pasang di tas anak sekolah biar kalau nyasar bisa langsung kabarin. Praktis banget, nggak perlu tulis nama & HP di tas yang bisa disalahgunakan.',
    rating: 5,
    location: 'Surabaya',
  },
  {
    name: 'Andi Pratama',
    role: 'Ojek Online',
    content: 'Gantungan kunci Balikin ini lifesaver! Pernah naruh kunci motor di dashboard, ilang, tapi orang yang nemu scan QR dan bisa balikin lagi.',
    rating: 5,
    location: 'Medan',
  },
  {
    name: 'Maya Sari',
    role: 'Traveler',
    content: 'Selalu pasang Balikin di passport holder dan luggage. Setiap traveling jadi lebih tenang. Privacy-nya juga terjaga banget!',
    rating: 5,
    location: 'Bali',
  },
  {
    name: 'Doni Kusuma',
    role: 'Pelajar SMA',
    content: 'Kunci boarding house sering ilang. Pas pakai Balikin, yang nemu langsung WA dan bisa ambil di kos. Recommended banget buat anak kos!',
    rating: 5,
    location: 'Yogyakarta',
  },
];
