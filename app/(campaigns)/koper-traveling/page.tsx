import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ACRYLIC_SHAPES } from '@/lib/acrylic-shapes';
import { getAcrylicStock } from '@/lib/product-stock';
import { PRODUCT_CATALOG } from '@/lib/product-catalog';

export const metadata: Metadata = {
  title: 'Tag QR untuk Koper Traveling | Balikin',
  description: 'Tambahkan identitas digital pada koper. Saat QR dipindai, penemu dapat melihat halaman kontak Balikin dan menghubungi Anda.',
  alternates: { canonical: '/koper-traveling' },
  openGraph: {
    title: 'Beri koper Anda identitas digital | Balikin',
    description: 'Tag QR Balikin membantu penemu koper menghubungi pemilik setelah memindai QR.',
    url: '/koper-traveling',
    images: [{ url: '/showcase/persegi panjang ok 1.webp', alt: 'Tag akrilik QR Balikin' }],
    type: 'website',
  },
};

type CampaignPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const shapeImages: Record<string, string> = {
  oval: '/showcase/oval ok 1.webp',
  octagon: '/showcase/persegi delapan 1.webp',
  heart: '/showcase/hati ok 1.webp',
  rectangle: '/showcase/persegi panjang ok 1.webp',
  'rectangle-motif': '/showcase/persegi panjang motif 1.webp',
  'rectangle-emboss': '/showcase/persegi panjang timbul 1.webp',
  circle: '/showcase/lingkaran ok 1.webp',
};

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID').format(price);

export default async function KoperTravelingPage({ searchParams }: CampaignPageProps) {
  const [stock, query] = await Promise.all([getAcrylicStock(), searchParams]);
  const attribution = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value && (key.startsWith('utm_') || key === 'gclid' || key === 'fbclid')) {
      attribution.set(key, Array.isArray(value) ? value[0] : value);
    }
  }
  const availableShapes = Object.values(ACRYLIC_SHAPES).filter(
    (shape) => (stock.get(`acrylic-${shape.key}`) ?? 0) > 0,
  );
  const checkoutFor = (shape: string) => {
    const params = new URLSearchParams(attribution);
    params.set('product', 'armor-tag');
    params.set('variant', `acrylic-${shape}`);
    return `/stickers/checkout?${params.toString()}`;
  };
  const price = PRODUCT_CATALOG['armor-tag'].price;

  return (
    <main className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-xl font-black tracking-tight" aria-label="Balikin, beranda">BALIKIN</Link>
        <Link href="/produk#akrilik" className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline dark:text-slate-200">Produk lain</Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-5 sm:px-8 md:grid-cols-[1fr_0.9fr] md:gap-14 md:pb-24 md:pt-10">
        <div className="order-2 md:order-1">
          <p className="mb-4 text-sm font-semibold text-blue-800 dark:text-blue-300">Untuk perjalanan yang lebih tenang</p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Koper Anda punya identitas. QR membuka halaman tag Balikin.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">Pasang tag QR Balikin pada koper. Jika dipindai, halaman tag menampilkan opsi kontak yang tersedia sesuai pengaturan pemilik.</p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a href="#pilih-tag" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-800 px-6 font-semibold text-white transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Pilih tag akrilik</a>
            <span className="text-sm text-slate-600 dark:text-slate-300">Akrilik QR · Rp{formatPrice(price)}</span>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">Bukan GPS atau alat pencegah pencurian. Informasi hanya dapat dibuka setelah QR dipindai.</p>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 md:order-2 dark:bg-slate-900">
          <Image src="/showcase/persegi panjang ok 1.webp" alt="Tag akrilik QR Balikin untuk dipasang pada koper" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-5" />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Satu scan membuka halaman tag.</h2>
            <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">Tidak perlu aplikasi khusus untuk memindai. Penemu menggunakan kamera ponsel untuk membuka halaman tag Anda.</p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            {[
              ['01', 'Pasang', 'Gantungkan tag QR pada koper.'],
              ['02', 'Pindai', 'Penemu memindai QR dengan ponsel.'],
              ['03', 'Lihat opsi kontak', 'Penemu dapat menggunakan opsi kontak yang tersedia pada halaman tag.'],
            ].map(([number, title, description]) => (
              <li key={number} className="border-t-2 border-blue-800 pt-4 dark:border-blue-400">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">{number}</span>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="pilih-tag" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-16 sm:px-8 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Pilih bentuk akrilik</h2>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">Pilih bentuk yang tersedia saat ini. Setiap tag akrilik QR berharga Rp{formatPrice(price)}.</p>
        </div>
        {availableShapes.length ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {availableShapes.map((shape) => (
              <article key={shape.key} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative aspect-square bg-slate-50 dark:bg-slate-900">
                  {shapeImages[shape.key] ? (
                    <Image src={shapeImages[shape.key]} alt={shape.label} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-4" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">{shape.label}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="min-h-10 text-sm font-semibold">{shape.label}</h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Rp{formatPrice(price)}</p>
                  <a href={checkoutFor(shape.key)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-800 px-3 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Pilih bentuk</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-200 p-6 dark:border-slate-700">
            <p className="font-semibold">Akrilik sedang tidak tersedia.</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Periksa kembali nanti atau lihat opsi produk lain.</p>
            <Link href="/produk#akrilik" className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-800 underline underline-offset-4 dark:text-blue-300">Lihat produk Balikin</Link>
          </div>
        )}
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">Mencari opsi yang lebih ringkas? <Link href="/stickers" className="font-semibold text-blue-800 underline underline-offset-4 dark:text-blue-300">Lihat pilihan stiker</Link>.</p>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Yang perlu diketahui</h2>
          <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-700">
            {[
              ['Apakah tag dapat melacak lokasi koper?', 'Tidak. Tag QR tidak memiliki GPS dan tidak melacak lokasi secara otomatis.'],
              ['Kapan halaman kontak dapat dibuka?', 'Setelah seseorang memindai QR pada tag dengan kamera ponsel dan memiliki koneksi internet.'],
              ['Apakah tag mencegah koper dicuri atau menjamin kembali?', 'Tidak. Tag adalah identitas digital dan jalur kontak; hasil pengembalian bergantung pada penemu dan situasi.'],
              ['Apa yang terjadi setelah dipindai?', 'Pemindai membuka halaman tag. Dari sana, mereka dapat menggunakan opsi kontak yang tersedia untuk menghubungi pemilik.'],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800">{question}<span aria-hidden="true" className="text-xl text-blue-800 group-open:rotate-45 dark:text-blue-300">+</span></summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-slate-700 dark:text-slate-300">{answer}</p>
              </details>
            ))}
          </div>
          {availableShapes.length > 0 && <a href="#pilih-tag" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-800 px-6 font-semibold text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800">Pilih tag akrilik</a>}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-slate-600 sm:px-8 dark:text-slate-400">
        Balikin · Identitas digital untuk barang Anda
      </footer>
    </main>
  );
}
