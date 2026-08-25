'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wallet, ShieldAlert, Zap, ArrowRight } from 'lucide-react';

const comparisonRows = [
  {
    aspect: 'Biaya Investasi',
    bluetooth: 'Sangat Mahal (Rp400rb – Rp600rb++ per satu barang).',
    phoneNumber: 'Gratis, tapi mengorbankan keamanan.',
    balikin: 'Sangat Terjangkau (Hanya Rp35.000 sekali bayar).',
  },
  {
    aspect: 'Biaya Perawatan',
    bluetooth: 'Harus ganti baterai secara berkala atau beli baru jika baterai tanam habis.',
    phoneNumber: 'Tidak ada.',
    balikin: 'Rp0,- Seumur Hidup. Tidak pakai baterai, tidak perlu di-charge.',
  },
  {
    aspect: 'Keamanan Privasi',
    bluetooth: 'Aman, tapi memicu risiko stalking jarak dekat jika disalahgunakan orang lain.',
    phoneNumber: 'Sangat Berbahaya. Nomor Anda bisa dicatat penjahat untuk penipuan, spam, atau teror WA.',
    balikin: '100% Aman. Penemu menghubungi Anda via tombol WhatsApp — nomor HP Anda tidak tercetak di barang.',
  },
  {
    aspect: 'Radius Pelacakan',
    bluetooth: 'Terbatas radius Bluetooth (±10-120 meter). Tidak berguna jika barang terbawa ke luar kota/pulau.',
    phoneNumber: 'Tergantung niat baik penemu.',
    balikin: 'Global & Unlimited. Selama penemu memiliki koneksi internet dan kamera HP, barang Anda bisa dilaporkan dari mana saja.',
  },
];

const logicPoints = [
  {
    icon: Wallet,
    title: 'Rp35.000 vs Ribetnya Kehilangan Dompet',
    desc: 'Harga satu lisensi pintar Balikin hanya Rp35.000. Bandingkan dengan biaya, waktu, dan kepanikan jika Anda harus mengurus ulang KTP, SIM, STNK di dalam dompet yang hilang, atau membeli kunci paspor dan kunci motor baru yang nilainya jutaan rupiah. Investasi Rp35.000 sekali ini jauh lebih ringan dibanding kerepotan mengurus dokumen atau membeli barang pengganti.',
  },
  {
    icon: ShieldAlert,
    title: 'Privasi Anda Tetap Aman',
    desc: 'Menempelkan nomor WhatsApp langsung pada barang berharga sama saja dengan membagikan data pribadi Anda ke ribuan orang asing di jalanan. Dengan Balikin, Anda membuka pintu bagi penemu berniat baik untuk mengembalikan barang, sekaligus mengunci rapat pintu bagi pelaku kejahatan siber.',
  },
  {
    icon: Zap,
    title: 'Selalu Siap, Tanpa Baterai',
    desc: 'Alat elektronik bisa rusak terkena air, kehabisan baterai, atau mati total saat Anda sangat membutuhkannya. Balikin menggunakan kode QR berbasis web yang melekat pada material kokoh—siap bekerja mendeteksi barang Anda kapan saja, tahun kapan saja, tanpa pernah kehabisan daya.',
  },
];

export function WhyBuyComparisonSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Mengapa Anda Jelas Merugi Jika Tidak Menggunakan Balikin?
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gantungan kunci biasa tidak bisa bicara. Bluetooth tracker terlalu mahal. Menulis nomor HP di barang mengundang bahaya.
            Ini adalah perbandingan logis mengapa Balikin adalah satu-satunya solusi yang masuk akal.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="max-w-5xl mx-auto mb-16 overflow-x-auto rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-slate-800">
                <TableHead className="min-w-[160px] dark:text-white">Tantangan Perlindungan Barang</TableHead>
                <TableHead className="min-w-[220px] dark:text-white">Pelacak Bluetooth (AirTag/SmartTag)</TableHead>
                <TableHead className="min-w-[220px] dark:text-white">Menulis Nomor HP di Barang</TableHead>
                <TableHead className="min-w-[220px] bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Sistem Smart Tag Balikin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row) => (
                <TableRow key={row.aspect} className="dark:border-slate-700">
                  <TableCell className="font-medium text-gray-900 dark:text-white">{row.aspect}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300">{row.bluetooth}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-300">{row.phoneNumber}</TableCell>
                  <TableCell className="text-sm text-gray-800 bg-blue-50/50 dark:bg-blue-500/10 dark:text-gray-200 font-medium">{row.balikin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h3 className="text-2xl font-bold dark:text-white">3 Alasan Kenapa Balikin Layak Jadi Pilihan Anda</h3>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {logicPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <point.icon className="h-10 w-10 text-blue-600" aria-hidden="true" />
                  </div>
                  <h4 className="font-bold mb-2 text-center dark:text-white">{point.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{point.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <div className="text-center">
          <Link href="#konfigurator">
            <Button size="lg" className="text-lg px-8 py-6 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all">
              Amankan Barang Saya Sekarang — Sebelum Terlambat
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
