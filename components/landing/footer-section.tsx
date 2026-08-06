'use client';

import Link from 'next/link';
import { QrCode } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="border-t dark:border-slate-700 py-12 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <span className="text-xl font-bold dark:text-white">Balikin</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital. Karena kebaikan harus dimudahkan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Produk</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><Link href="/how-it-works" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Cara Kerja</Link></li>
              <li><Link href="/sign-up" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Daftar Gratis</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Harga</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><Link href="/blog" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Kontak</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Tentang Kami</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Kebijakan Privasi</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-600 hover:underline focus-visible:text-blue-600 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded">Syarat & Ketentuan</Link></li>
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