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
    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
        className={`my-8 min-h-[180px] rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 text-center ${className}`}
      >
        <AdLabel />
        <h3 className="mt-2 text-xl font-bold text-foreground">
          Barang hilang? Bikin balik lagi pakai QR Dinamis.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Ganti nomor WA kapan aja tanpa ganti gantungan. Nomor tidak dicetak di
          fisik &amp; tidak ada di kode halaman. Tracking kota scan.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={`/yt-launch${UTM(variant)}`}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Coba QR Dinamis — Rp35rb
          </Link>
          <Link
            href={`/dashboard/new${UTM(variant)}`}
            className="inline-flex items-center justify-center rounded-xl border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
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
        className={`my-6 min-h-[96px] rounded-xl border border-primary/20 bg-primary/[0.04] p-4 ${className}`}
      >
        <AdLabel />
        <Link
          href={`/yt-launch${UTM(variant)}`}
          className="mt-1 flex items-center justify-between gap-3 hover:opacity-90"
        >
          <span className="text-sm">
            <strong className="font-bold text-foreground">
              Ganti nomor HP? QR-nya tetap sama.
            </strong>{' '}
            <span className="text-muted-foreground">
              QR Dinamis Balikin — Rp35rb, tanpa baterai, seumur hidup.
            </span>
          </span>
          <span aria-hidden className="shrink-0 text-lg font-bold text-primary">→</span>
        </Link>
      </aside>
    );
  }

  // variant === 'mid'
  return (
    <aside
      aria-label="Iklan produk Balikin"
      className={`my-8 min-h-[120px] rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 ${className}`}
    >
      <AdLabel />
      <Link
        href={`/yt-launch${UTM(variant)}`}
        className="mt-1 flex items-center justify-between gap-3 hover:opacity-90"
      >
        <span>
          <strong className="block font-bold text-foreground">
            Tempel sekali, lindungi selamanya.
          </strong>
          <span className="text-sm text-muted-foreground">
            Stiker/akrilik QR Balikin + Mode Hilang merah + notifikasi scan. Lihat demo 30 detik.
          </span>
        </span>
        <span aria-hidden className="shrink-0 text-xl font-bold text-primary">→</span>
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
