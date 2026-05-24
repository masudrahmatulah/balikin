'use client';

import Link from 'next/link';
import { QrCode } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="border-t py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <span className="text-xl font-bold">Balikin</span>
            </div>
            <p className="text-gray-600 text-sm">
              Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital. Karena kebaikan harus dimudahkan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/how-it-works" className="hover:text-blue-600">Cara Kerja</Link></li>
              <li><Link href="/sign-up" className="hover:text-blue-600">Daftar Gratis</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600">Harga</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/contact" className="hover:text-blue-600">Kontak</Link></li>
              <li><Link href="/about" className="hover:text-blue-600">Tentang Kami</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-600">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Balikin. Smart Lost & Found Platform Indonesia.</p>
          <p className="mt-2">Dibuat dengan ❤️ di Indonesia</p>
        </div>
      </div>
    </footer>
  );
}