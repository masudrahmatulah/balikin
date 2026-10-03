export type ArticleType = "pillar" | "supporting" | "commercial";

export const BRAND_PILLARS = [
  { value: "cerita-barang-kembali", label: "Cerita Barang yang Kembali" },
  { value: "kebaikan-si-penemu", label: "Kebaikan Si Penemu" },
  { value: "kebiasaan-jaga-barang", label: "Kebiasaan Menjaga Barang" },
  { value: "aman-jelas-transparan", label: "Aman, Jelas, dan Transparan" },
] as const;

export type BrandPillar = (typeof BRAND_PILLARS)[number]["value"];

export function getBrandPillarLabel(value: string): string {
  return BRAND_PILLARS.find((pillar) => pillar.value === value)?.label || value;
}

export function getSeedBrandPillar(title: string, focusKeyword: string, articleType: string): BrandPillar {
  const text = `${title} ${focusKeyword}`.toLowerCase();

  if (/menemukan|barang temuan|mengembalikan|mengembalikan barang|mengajarkan anak/.test(text)) {
    return "kebaikan-si-penemu";
  }
  if (/qr|privasi|notifikasi|aplikasi|bluetooth|beli|solusi|memilih|tag identitas|microchip/.test(text)) {
    return "aman-jelas-transparan";
  }
  if (/checklist|mencegah|keamanan|mengamankan|menandai|identitas|menyimpan|persiapan|aksesori|tertukar|kontak darurat/.test(text)) {
    return "kebiasaan-jaga-barang";
  }
  if (articleType === "commercial") return "aman-jelas-transparan";
  return "cerita-barang-kembali";
}

export type WordTarget = {
  min: number;
  max: number;
};

export const WORD_TARGETS: Record<ArticleType, WordTarget> = {
  pillar: { min: 2000, max: 2500 },
  supporting: { min: 800, max: 1500 },
  commercial: { min: 700, max: 1200 },
};

export function getWordTarget(articleType: string): WordTarget {
  return WORD_TARGETS[articleType as ArticleType] || WORD_TARGETS.supporting;
}

export function countContentWords(value: string): number {
  return value.replace(/[#*_`>\[\](){}|]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}
