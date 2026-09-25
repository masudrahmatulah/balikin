export type ArticleType = "pillar" | "supporting" | "commercial";

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
