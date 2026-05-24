'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { X, Check, Award } from 'lucide-react';

export function ComparisonSection() {
  return (
    <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Balikin vs Cara Tradisional
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kenapa ribuan orang beralih ke Balikin untuk proteksi barang mereka?
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <Card className="border-2 border-gray-200 opacity-75">
                <CardHeader className="text-center pb-4 border-b">
                  <div className="flex justify-center mb-2">
                    <X className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">Cara Tradisional</h3>
                  <p className="text-sm text-gray-500">Stiker nama di kunci/tas</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {[
                      { text: 'Privasi terpapar (nama & HP terlihat)', bad: true },
                      { text: 'Ganti nomor = harus ganti stiker', bad: true },
                      { text: 'Tidak bisa update status hilang', bad: true },
                      { text: 'Penemu harus simpan nomor dulu', bad: true },
                      { text: 'Tidak ada tracking lokasi', bad: true },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {item.bad ? (
                          <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span className="text-gray-600">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Balikin */}
              <Card className="border-2 border-blue-600 shadow-xl shadow-blue-600/20 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    LEBIH BAIK
                  </span>
                </div>
                <CardHeader className="text-center pb-4 border-b bg-blue-50/50">
                  <div className="flex justify-center mb-2">
                    <Award className="h-8 w-8 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-600">Balikin</h3>
                  <p className="text-sm text-gray-500">QR code dinamis smart</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {[
                      { text: 'Privasi terjaga (hanya QR yang terlihat)', bad: false },
                      { text: 'Ganti nomor = update di dashboard saja', bad: false },
                      { text: 'Mode Hilang dengan alert darurat', bad: false },
                      { text: 'Penemu langsung WhatsApp (tanpa simpan nomor)', bad: false },
                      { text: 'Tracking lokasi setiap scan', bad: false },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {item.bad ? (
                          <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}