/**
 * Generates a URL-friendly slug from a title and optional date string.
 * Format: word1-word2-word3-YYYYMMDD (max 3 words from title).
 */
export function generateSlug(title: string, date?: string): string {
  const dateStr = date
    ? date.replace(/-/g, "").slice(0, 8)
    : new Date().toISOString().replace(/-/g, "").slice(0, 8);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);

  return [...words, dateStr].join("-");
}
