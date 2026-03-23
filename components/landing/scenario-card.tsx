'use client';

import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface Scenario {
  icon: LucideIcon;
  title: string;
  situation: string;
  solution: string;
  color: string;
}

interface ScenarioCardProps {
  scenario: Scenario;
  index: number;
}

export function ScenarioCard({ scenario, index }: ScenarioCardProps) {
  const Icon = scenario.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={`h-full p-6 hover-card-effect border-2 hover:border-${scenario.color}-200`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${scenario.color}-100 mb-4`}>
          <Icon className={`h-8 w-8 text-${scenario.color}-600`} />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{scenario.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          <span className="font-medium">Pernah ngalamin ini?</span>
        </p>
        <p className="text-gray-600 mb-4">{scenario.situation}</p>
        <div className={`p-3 rounded-lg bg-${scenario.color}-50 border border-${scenario.color}-100`}>
          <p className={`text-sm font-medium text-${scenario.color}-700`}>
            ✓ {scenario.solution}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// Scenarios data
import {
  GraduationCap,
  Footprints,
  Bike,
  Plane,
} from 'lucide-react';

export const scenarios: Scenario[] = [
  {
    icon: GraduationCap,
    title: 'Anak Sekolah',
    situation: 'Anak sering lupa naruh kunci atau tas di sekolah. Takut kalau ada orang iseng yang salah pakai?',
    solution: 'Pasang Balikin di tas & kunci. Kalau ketemu orang baik, tinggal scan QR langsung bisa hubungi!',
    color: 'blue',
  },
  {
    icon: Footprints,
    title: 'Pejalan Kaki',
    situation: 'Dompet atau HP sering terlepas saat jalan-jalan atau lari pagi? Bingung cara balikin kalau ada yang nemu?',
    solution: 'QR Balikin bikin penemu lebih peduli untuk mengembalikan, karena cara hubunginya super gampang!',
    color: 'green',
  },
  {
    icon: Bike,
    title: 'Pengendara Motor',
    situation: 'Kunci motor sering lupa dicabut atau ditaruh sembarangan? Bahaya kalau dicuri orang yang nggak bertanggung jawab?',
    solution: 'Dengan Balikin, yang nemu kunci bisa langsung WA dan koordinasi balikin. Aman & cepat!',
    color: 'red',
  },
  {
    icon: Plane,
    title: 'Traveler',
    situation: 'Passport, koper, atau barang bawaan sering tertukar atau tertinggal di bandara/hotel?',
    solution: 'Pasang Balikin di barang bawaan. Petugas atau penemu bisa langsung kontak tanpa lihat privasi kamu!',
    color: 'purple',
  },
];
