import type { Metadata } from "next";
import { CampaignForm } from "@/components/campaign-form";
import Image from "next/image";
import { Shield, Zap, RefreshCw, MapPin, Gift, CheckCircle2, Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Balikin QR Dinamis - Ganti Nomor Tanpa Ganti Gantungan | YouTube Exclusive",
  description:
    "Nonton di YouTube? Ini link khusus penonton. QR Dinamis Balikin: ganti WA kapan aja tanpa ganti fisik. Nomor tidak dicetak di barang & tidak ada di kode halaman. Tracking scan kota. Mulai Rp35rb.",
};

export default function YTLaunchPage() {
  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-black flex justify-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl">
        {/* Hero - YT Exclusive */}
        <section className="relative overflow-hidden pt-8 pb-10 px-4">
          <Image
            src="/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp"
            alt="Balikin QR Dinamis"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white dark:from-slate-950/95 dark:via-slate-950/90 dark:to-slate-950 z-0" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold mb-4">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> KHUSUS PENONTON YOUTUBE
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-white mb-3">
              Ganti Nomor HP?
              <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">QR-nya Tetap Sama.</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Ini <strong>QR Dinamis</strong> — bukan spidol. Ganti WA kapan aja di dashboard, gantungan akrilik yang nempel di kunci/koper <strong>tidak perlu ganti</strong>. Nomor juga <strong>tidak dicetak di fisik & tidak ada di kode halaman</strong> (anti bot spam).
            </p>
            <div className="flex flex-col gap-2 text-left bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex gap-3 items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> QR Dinamis - update kontak 10 detik</div>
              <div className="flex gap-3 items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> Anti cetak permanen - lebih rapi dari spidol</div>
              <div className="flex gap-3 items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> Tracking kota scan + Mode Hilang merah</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 text-xs text-amber-900 dark:text-amber-200 text-left">
              <strong>Jujur MVP:</strong> Saat tombol WA diklik, finder akan dialihkan ke chat WA kamu (nomor terlihat di chat, wajar). Keuntungannya nomor tidak nempel permanen di barang & bisa diganti kapan aja. Full relay privat coming soon.
            </div>

            {/* CTA YT */}
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">Amankan Slot YouTube - Diskon 50%</h2>
              <p className="text-red-100 text-sm mb-4">100 penonton pertama via link YouTube ini. Masukkan email, kami kirim konfigurator + voucher <strong>YT50</strong></p>
              <div className="max-w-md mx-auto">
                <CampaignForm campaignName="yt-launch" campaignTitle="Balikin YT Launch - QR Dinamis" />
              </div>
              <p className="text-xs text-red-200 mt-3">Sudah ada video demo? Link di deskripsi YouTube mengarah ke sini.</p>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="py-8 px-4">
          <h2 className="text-lg font-bold text-center mb-2">Tonton Demo 30 Detik</h2>
          <p className="text-xs text-center text-slate-500 mb-4">Scan - Mode Hilang - WA via /api/go (anti bot)</p>
          <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <iframe className="w-full h-full" src="https://www.youtube-nocookie.com/embed/eJcko-jT_WE" title="Balikin Demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        </section>

        {/* Why vs Spidol */}
        <section className="py-8 px-4 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-center mb-6">Kenapa QR Dinamis &gt; Tulis Spidol?</h2>
          <div className="grid gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex gap-4">
              <RefreshCw className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div><h3 className="font-bold text-sm">Ganti Nomor Gratis</h3><p className="text-xs text-slate-600 dark:text-slate-400">Spidol: coret, jelek, beli baru. Balikin: update di dashboard, QR sama tetap jalan.</p></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex gap-4">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div><h3 className="font-bold text-sm">Anti Bot Scraper</h3><p className="text-xs text-slate-600 dark:text-slate-400">Nomor tidak ada di HTML/JS bundle. Hanya server yang tau, via <code>/api/go/[slug]</code>.</p></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex gap-4">
              <MapPin className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <div><h3 className="font-bold text-sm">Tracking Kota Scan</h3><p className="text-xs text-slate-600 dark:text-slate-400">Setiap scan kecatat kota + jam. Tau barang terakhir di mana.</p></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 flex gap-4">
              <Zap className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div><h3 className="font-bold text-sm">Tanpa Baterai, Seumur Hidup</h3><p className="text-xs text-slate-600 dark:text-slate-400">Vs AirTag 600rb + ganti baterai tiap tahun.</p></div>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-8 px-4">
          <h2 className="text-lg font-bold text-center mb-6">Cocok Untuk</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-4 border rounded-xl"><Smartphone className="w-6 h-6 text-blue-600" /><div><h4 className="font-bold text-sm">Kunci & Helm</h4><p className="text-xs text-slate-600">Hilang di parkiran kampus/kos</p></div></div>
            <div className="flex gap-3 p-4 border rounded-xl"><Gift className="w-6 h-6 text-pink-600" /><div><h4 className="font-bold text-sm">Koper Haji/Travel</h4><p className="text-xs text-slate-600">Tidak salah ambil di bandara, rapi tanpa lakban</p></div></div>
            <div className="flex gap-3 p-4 border rounded-xl"><Shield className="w-6 h-6 text-green-600" /><div><h4 className="font-bold text-sm">Tas Anak Sekolah</h4><p className="text-xs text-slate-600">Botol, bekal, jaket - ganti nomor ortu gampang</p></div></div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-8 px-4 bg-slate-900 text-white text-center">
          <h2 className="text-lg font-bold mb-2">Link YouTube Kamu Menuju Kesini</h2>
          <p className="text-sm text-slate-300 mb-4">Pasang di deskripsi & pin comment: <span className="font-mono text-white">balikin.online/yt-launch</span>. Semua lead kecatat sebagai <code>yt-launch</code></p>
          <CampaignForm campaignName="yt-launch" campaignTitle="Balikin YT Launch - QR Dinamis" />
        </section>

        <footer className="py-6 px-4 text-center text-xs text-slate-500 border-t">© 2026 Balikin — QR Dinamis • /api/go anti-bot • Tracking scan</footer>
      </div>
    </div>
  );
}
