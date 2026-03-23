import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Droplets, ShieldCheck, Sticker, SunMedium, MessageCircle } from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STICKER_PACK_PRICE, STICKER_PACK_SIZE, WHATSAPP_ORDER_NUMBER } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sticker Vinyl Pack',
  description: 'Sticker Vinyl Balikin isi 6 untuk helm, laptop, koper, dan barang sehari-hari. Waterproof, anti-UV, dan terhubung ke WhatsApp alert.',
  path: '/stickers',
  keywords: ['sticker vinyl qr', 'stiker barang hilang', 'sticker helm qr', 'sticker koper qr'],
});

export default function StickersPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent('Halo, saya tertarik pesan Sticker Vinyl Pack Balikin isi 6.')}`;

  return (
    <MarketingShell
      title="Jangan Biarkan Barang Kesayanganmu Hilang Tanpa Jejak."
      description="Sticker Pintar Balikin: murah, kuat, dan menghubungkan Anda langsung dengan penemu jujur. Cocok untuk helm, laptop, koper, dan barang yang paling sering dibawa keluar rumah."
    >
      <div className="not-prose space-y-8">
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Sticker className="h-6 w-6 text-emerald-600" />
              Sticker Vinyl Pack Isi {STICKER_PACK_SIZE}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Cuma <span className="font-semibold text-slate-950">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</span> untuk satu pack isi {STICKER_PACK_SIZE} stiker. Artinya Anda bisa mengamankan lebih dari satu barang penting tanpa ribet.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <BadgeCheck className="h-4 w-4 text-slate-600" />
                    Silver Verified Badge
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Meningkatkan kepercayaan penemu saat melihat halaman publik sticker Anda.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    WhatsApp Scan Alert
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Begitu sticker di-scan saat mode hilang, Anda langsung dapat alert instan via WhatsApp.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    Waterproof
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Material vinyl tahan air untuk pemakaian harian di helm, botol, koper, dan gadget.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <SunMedium className="h-4 w-4 text-amber-600" />
                    Anti-UV
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Laminasi membantu QR tetap tajam dan tidak cepat pudar terkena matahari.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Starter Product</p>
              <p className="mt-3 text-4xl font-bold text-slate-950">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">1 pack isi {STICKER_PACK_SIZE} stiker vinyl dengan QR unik masing-masing.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Cocok untuk helm, laptop, koper, dan botol minum</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Aktivasi satu per satu sesuai barang yang Anda pilih</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" /> Riwayat scan 30 hari untuk sticker</li>
              </ul>
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/stickers/checkout">Amankan Barang Saya Sekarang</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">Tanya via WhatsApp</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">Pembayaran awal memakai QRIS manual dan diverifikasi admin Balikin.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
