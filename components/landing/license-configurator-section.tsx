'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, Sparkles } from 'lucide-react';

const BASE_PRICE = 35000;

type MaterialId = 'vinyl' | 'acrylic' | 'stainless';
type ShapeId = 'bulat' | 'oval' | 'kotak' | 'heart';

const materials: {
  id: MaterialId;
  name: string;
  desc: string;
  addOn: number;
  hasShapes?: boolean;
}[] = [
  { id: 'vinyl', name: 'Premium Vinyl Sticker', desc: 'Standar, sudah termasuk di harga lisensi', addOn: 0 },
  { id: 'acrylic', name: 'Wadah Premium Acrylic Tag', desc: 'Bulat, Oval, Kotak, atau Heart', addOn: 10000, hasShapes: true },
  { id: 'stainless', name: 'Wadah Tactical Stainless / Metal', desc: 'Untuk koper atau barang outdoor', addOn: 29000 },
];

const shapes: { id: ShapeId; name: string }[] = [
  { id: 'bulat', name: 'Bulat' },
  { id: 'oval', name: 'Oval' },
  { id: 'kotak', name: 'Kotak' },
  { id: 'heart', name: 'Heart' },
];

const CUSTOM_PRINT_PRICE = 5000;

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}

export function LicenseConfiguratorSection() {
  const [material, setMaterial] = useState<MaterialId>('vinyl');
  const [shape, setShape] = useState<ShapeId>('bulat');
  const [customPrint, setCustomPrint] = useState(false);

  const selectedMaterial = materials.find((m) => m.id === material)!;

  const total = useMemo(() => {
    let sum = BASE_PRICE + selectedMaterial.addOn;
    if (customPrint) sum += CUSTOM_PRINT_PRICE;
    return sum;
  }, [selectedMaterial, customPrint]);

  return (
    <section id="konfigurator" className="container mx-auto px-4 py-16 dark:bg-slate-900">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
            Konfigurator Interaktif
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Rakit Lisensi Balikin Anda Sendiri</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Harga dasar Rp35.000 sudah termasuk 1 Lisensi Akun/ID QR unik di platform balikin.online + media standar. Pilih wadah dan opsi desain, harga otomatis menyesuaikan.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">1. Pilih Wadah Fisik</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMaterial(m.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      material === m.id ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-pressed={material === m.id}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{m.name}</span>
                      {material === m.id && <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
                    <span className="text-sm font-semibold text-blue-700">
                      {m.addOn === 0 ? 'Termasuk' : `+${formatRupiah(m.addOn)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedMaterial.hasShapes && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-semibold text-gray-900 mb-3">2. Pilih Bentuk Acrylic</h3>
                <div className="flex flex-wrap gap-3">
                  {shapes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShape(s.id)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        shape === s.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      aria-pressed={shape === s.id}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {selectedMaterial.hasShapes ? '3.' : '2.'} Opsi Desain
              </h3>
              <button
                type="button"
                onClick={() => setCustomPrint((v) => !v)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  customPrint ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-pressed={customPrint}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-gray-900">Cetak Kustom Nama / Foto Sendiri</span>
                    <p className="text-xs text-gray-500">Tercetak langsung di atas tag fisik</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-700">+{formatRupiah(CUSTOM_PRINT_PRICE)}</span>
                    {customPrint && <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-2 border-blue-600 sticky top-24">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Lisensi</h3>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex justify-between">
                    <span>Lisensi Akun/ID QR + Vinyl</span>
                    <span>{formatRupiah(BASE_PRICE)}</span>
                  </li>
                  {selectedMaterial.addOn > 0 && (
                    <li className="flex justify-between">
                      <span>
                        {selectedMaterial.name}
                        {selectedMaterial.hasShapes ? ` (${shapes.find((s) => s.id === shape)?.name})` : ''}
                      </span>
                      <span>+{formatRupiah(selectedMaterial.addOn)}</span>
                    </li>
                  )}
                  {customPrint && (
                    <li className="flex justify-between">
                      <span>Cetak Kustom Nama/Foto</span>
                      <span>+{formatRupiah(CUSTOM_PRINT_PRICE)}</span>
                    </li>
                  )}
                </ul>
                <div className="border-t pt-4 mb-6 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.15, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold gradient-text"
                  >
                    {formatRupiah(total)}
                  </motion.span>
                </div>
                <Link href="/stickers" className="block">
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
                    Aktifkan Lisensi Ini
                  </Button>
                </Link>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Satu kali bayar, berlaku seumur hidup. Cetak fisik diproses print-on-demand sesuai pilihan Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
