import Link from 'next/link';

export type HouseAdVariant = 'top' | 'mid' | 'end';

interface BlogHouseAdProps {
  variant?: HouseAdVariant;
  className?: string;
}

const UTM = (variant: HouseAdVariant) =>
  `?utm_source=blog&utm_medium=housead_${variant}&utm_campaign=yt-launch`;

function AdLabel() {
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
      Iklan • Produk Balikin
    </span>
  );
}

/**
 * House-ad produk Balikin — otomatis di semua artikel (lama + baru).
 * Opt-out per-artikel: tambah modul `{ type: 'no_ads' }` di modules JSONB.
 */
export function BlogHouseAd({ variant = 'mid', className = '' }: BlogHouseAdProps) {
  if (variant === 'end') {
    return (
      <aside
        aria-label="Iklan produk Balikin"
        className={`my-8 min-h-[180px] rounded-2xl border border-brand-navy bg-brand-navy p-6 text-center text-white shadow-xl shadow-brand-navy/20 dark:border-brand-navy-light dark:bg-brand-navy-light ${className}`}
      >
        <AdLabel />
        <h3 className="mt-3 text-xl font-bold text-white">
          Barang hilang? Bikin balik lagi pakai QR Dinamis.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          Ganti nomor WA kapan aja tanpa ganti gantungan. Nomor tidak dicetak di
          fisik &amp; tidak ada di kode halaman. Tracking kota scan.
        </p>
        <p className="mt-3 text-xs font-semibold text-amber-300">
          ★★★★★ 4.8 • 50+ pemilik terbantu
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={`/yt-launch${UTM(variant)}`}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff2938] to-[#d90f1d] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:opacity-90"
          >
            Coba QR Dinamis — Rp35rb
          </Link>
          <Link
            href={`/dashboard/new${UTM(variant)}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Buat Tag Gratis
          </Link>
        </div>
      </aside>
    );
  }

  if (variant === 'top') {
    return (
      <aside
        aria-label="Iklan produk Balikin"
        className={`my-6 min-h-[96px] rounded-xl border border-l-4 border-brand-red/30 border-l-brand-red bg-red-50 p-4 dark:border-brand-red/30 dark:bg-brand-red/10 ${className}`}
      >
        <AdLabel />
        <Link
          href={`/yt-launch${UTM(variant)}`}
          className="mt-1 flex items-center justify-between gap-3 hover:opacity-90"
        >
          <span className="text-sm">
            <strong className="font-bold text-gray-900 dark:text-white">
              Ganti nomor HP? QR-nya tetap sama.
            </strong>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              QR Dinamis Balikin — Rp35rb, tanpa baterai, seumur hidup.
            </span>
          </span>
          <span aria-hidden className="shrink-0 rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white">Lihat →</span>
        </Link>
      </aside>
    );
  }

  // variant === 'mid'
  return (
      <aside
        aria-label="Iklan produk Balikin"
        className={`my-8 min-h-[120px] rounded-xl border border-amber-300/70 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm dark:border-amber-700/50 dark:from-brand-red/15 dark:to-transparent ${className}`}
      >
        <AdLabel />
        <Link
        href={`/yt-launch${UTM(variant)}`}
        className="mt-1 flex items-center justify-between gap-3 hover:opacity-90"
        >
          <span>
            <span className="mb-1 inline-flex rounded-full bg-[#FFD700] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#221b00]">
              Terlaris • 8 desain
            </span>
            <strong className="block font-bold text-gray-900 dark:text-white">
              Tempel <span className="text-brand-red">sekali</span>, lindungi selamanya.
            </strong>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Stiker/akrilik QR Balikin + Mode Hilang merah + notifikasi scan. Lihat demo 30 detik.
            </span>
          </span>
          <span aria-hidden className="shrink-0 rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white shadow-md shadow-red-600/20">Demo →</span>
        </Link>
      </aside>
  );
}

/** Opt-out: artikel dengan modul `{ type: 'no_ads' }` tidak dipasangi house-ad. */
export function shouldShowHouseAds(modules: Array<{ type?: string }> | null | undefined): boolean {
  if (!modules || !Array.isArray(modules)) return true;
  return !modules.some((m) => m?.type === 'no_ads' || m?.type === 'hide_ads');
}

/** Hitung kata untuk aturan jumlah iklan (<500: akhir saja). */
export function countWords(markdown: string | null | undefined): number {
  if (!markdown) return 0;
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Bagi markdown per blok paragraf (`\n\n`) agar iklan tengah tidak memotong kalimat.
 * Mengembalikan [bagianAwal, bagianTengah, bagianAkhir] sesuai jumlah bagian.
 */
export function splitMarkdownBlocks(markdown: string, parts: 2 | 3): string[] {
  const blocks = markdown.split(/\n{2,}/);
  if (blocks.length < 4 || parts === 2) {
    if (parts === 2) {
      const mid = Math.ceil(blocks.length / 2);
      return [blocks.slice(0, mid).join('\n\n'), blocks.slice(mid).join('\n\n')];
    }
  }
  const per = Math.ceil(blocks.length / 3);
  return [
    blocks.slice(0, per).join('\n\n'),
    blocks.slice(per, per * 2).join('\n\n'),
    blocks.slice(per * 2).join('\n\n'),
  ];
}
