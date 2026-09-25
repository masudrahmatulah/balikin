export function slugifySeoValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureSlugContainsKeyword(slug: string, focusKeyword: string, maxLength = 100): string {
  const normalizedSlug = slugifySeoValue(slug);
  const keywordSlug = slugifySeoValue(focusKeyword);

  if (!keywordSlug) return normalizedSlug.slice(0, maxLength);
  if (keywordSlug.length >= maxLength) return keywordSlug.slice(0, maxLength);
  if (normalizedSlug.includes(keywordSlug)) return normalizedSlug.slice(0, maxLength);

  return `${keywordSlug}-${normalizedSlug}`.replace(/-+$/, "").slice(0, maxLength);
}

export function countKeywordOccurrences(content: string, keyword: string): number {
  const normalizedKeyword = keyword.trim().replace(/\s+/g, " ");
  if (!normalizedKeyword) return 0;

  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(escapedKeyword, "gi"))?.length || 0;
}
