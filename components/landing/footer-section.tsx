'use client';

import Link from 'next/link';
import Image from 'next/image';

export function FooterSection() {
  return (
    <footer className="border-t dark:border-slate-700 py-12 bg-gray-50 dark:bg-[#07101f]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#07101f] shadow-md shadow-red-600/20">
                <Image
                  src="/balikin_logo.webp"
                  alt="Balikin Logo"
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xl font-black tracking-tight dark:text-white">BALIKIN</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital. Karena kebaikan harus dimudahkan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Produk</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><Link href="/how-it-works" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Cara Kerja</Link></li>
              <li><Link href="/sign-up" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Daftar Gratis</Link></li>
              <li><Link href="/pricing" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Harga</Link></li>
              <li><Link href="/helpdesk" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Helpdesk AI</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><Link href="/blog" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Kontak</Link></li>
              <li><Link href="/help" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Pusat Bantuan</Link></li>
              <li><Link href="/about" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Tentang Kami</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Kebijakan Privasi</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-brand-red hover:underline focus-visible:text-brand-red focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t dark:border-slate-700 pt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Balikin. Smart Lost & Found Platform Indonesia.</p>
          <p className="mt-2">Dibuat dengan ❤️ di Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
