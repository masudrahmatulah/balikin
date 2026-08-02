'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  BookOpen,
  Badge,
  Heart,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';

const segments = [
  {
    id: 'corporate',
    icon: Building2,
    title: 'Satu Sistem Pintar untuk Ratusan Aset Kantor & Institusi Anda',
    subtitle: 'Jangan biarkan inventaris berharga, laptop kerja karyawan, atau berkas penting kantor hilang tanpa jejak.',
    features: [
      {
        icon: Badge,
        label: 'Custom Logo & Identitas',
        desc: 'Kami cetak QR Code Balikin menyatu dengan logo resmi instansi atau perusahaan Anda. Terlihat profesional, eksklusif, dan fungsional.',
      },
      {
        icon: Lock,
        label: 'Dasbor Manajemen Aset Massal',
        desc: 'Pantau dan kelola status ratusan aset digital kantor Anda hanya dari satu akun administrator pusat. Terpusat, rapi, dan terkendali.',
      },
      {
        icon: Heart,
        label: 'Merchandise yang Pasti Disimpan',
        desc: 'Berikan Smart Tag Balikin sebagai merchandise event atau hadiah karyawan. Souvenir premium yang memberikan rasa aman seumur hidup.',
      },
    ],
    cta: { text: 'Hubungi Tim Balikin untuk Penawaran Khusus Korporasi', href: '/contact' },
  },
  {
    id: 'community',
    icon: Users,
    title: 'Bikin Komunitas / Klub Anda Naik Kelas & Saling Melindungi',
    subtitle: 'Untuk komunitas sepeda, fotografi, traveling, atau klub motor—jangan biarkan barang hobi yang nilainya puluhan juta hilang.',
    features: [
      {
        icon: Badge,
        label: 'Identitas Anggota yang Cerdas',
        desc: 'Cetak nomor registrasi anggota atau logo komunitas langsung di atas Smart Tag pilihan (Akrilik/Logam).',
      },
      {
        icon: Heart,
        label: 'Solidaritas Digital',
        desc: 'Jika sesama anggota menemukan barang yang tertinggal di lokasi gathering, mereka bisa langsung menghubungi pemilik via chat aman tanpa canggung.',
      },
      {
        icon: Lock,
        label: 'Harga Paket Spesial Komunitas',
        desc: 'Semakin banyak anggota yang bergabung untuk memproteksi barang mereka, semakin hemat biaya lisensinya.',
      },
    ],
    cta: { text: 'Konsultasikan Desain Komunitas Anda di WhatsApp', href: 'https://wa.me/62812345678' },
  },
  {
    id: 'school',
    icon: BookOpen,
    title: 'Solusi Cerdas Sekolah Bebas "Barang Hilang & Tertukar"',
    subtitle: 'Tas, botol minum premium, buku, hingga jaket anak sering tertukar atau hilang di sekolah?',
    features: [
      {
        icon: Heart,
        label: 'Ramah Anak & Privasi Terjaga',
        desc: 'Orang tua tidak perlu cemas menulis nomor HP atau nama lengkap anak di tas sekolah. Sistem Balikin menjaga nomor orang tua tetap 100% rahasia.',
      },
      {
        icon: Badge,
        label: 'Paket Atribut Sekolah',
        desc: 'Sangat cocok diintegrasikan dengan pembagian atribut tahun ajaran baru atau kartu pelajar pintar.',
      },
      {
        icon: Lock,
        label: 'Ketenangan Pikiran Orang Tua',
        desc: 'Jika barang anak tertinggal di sekolah, penemu bisa langsung menghubungi orang tua via sistem aman tanpa khawatir data pribadi anak tersebar.',
      },
    ],
    cta: { text: 'Amankan Aset Sekolah Anda Sekarang', href: '/contact' },
  },
];

export function B2bScalabilitySection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Balikin untuk Organisasi Anda</h2>
            <p className="text-gray-600">
              Cukup satu kali integrasi, sistem admin kami siap memetakan ratusan ID QR ke dalam struktur organisasi Anda tanpa ribet.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="space-y-12 max-w-5xl mx-auto">
            {segments.map((segment, idx) => {
              const Icon = segment.icon;
              return (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="pt-8 pb-6">
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Left: Title & Features */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <Icon className="h-8 w-8 text-blue-600" aria-hidden="true" />
                            <h3 className="text-2xl font-bold">{segment.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            {segment.subtitle}
                          </p>

                          <ul className="space-y-4">
                            {segment.features.map((feature, i) => {
                              const FeatureIcon = feature.icon;
                              return (
                                <li key={i} className="flex gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <FeatureIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-gray-900">{feature.label}</p>
                                    <p className="text-xs text-gray-600 mt-1">{feature.desc}</p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Right: CTA */}
                        <div className="flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">
                            Mulai proteksi aset organisasi Anda:
                          </p>
                          <Link href={segment.cta.href} className="block w-full">
                            <Button className="w-full" size="lg">
                              {segment.cta.text}
                              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Button>
                          </Link>
                          <p className="text-xs text-gray-500 mt-4">
                            Tim kami siap membantu konfigurasi massal sesuai kebutuhan Anda.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 bg-blue-50 rounded-xl p-8 max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-600 mb-2">✨ Nilai Tambah Eksklusif untuk Organisasi</p>
            <p className="text-lg font-semibold text-gray-900">
              Dukungan admin dedicated, integrasi sistem custom, dan harga volume khusus menanti Anda.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
