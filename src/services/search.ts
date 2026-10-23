export interface SearchEntry {
  type: 'Lesson' | 'Module' | 'Lab' | 'Challenge' | 'Tool' | 'Cheat Sheet' | 'Glossary' | 'Source' | 'Note';
  id: string;
  title: string;
  subtitle: string;
  route: string;
  text: string;
}

export function scoreEntry(entry: SearchEntry, q: string): number {
  const query = q.toLowerCase().trim();
  if (!query) return 0;
  const terms = query.split(/\s+/);
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  const text = entry.text.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 12;
    if (subtitle.includes(t)) score += 6;
    if (text.includes(t)) score += 2;
  }
  if (title === query) score += 30;
  if (title.startsWith(query)) score += 15;
  return score;
}

export function searchEntries(all: SearchEntry[], q: string, limit = 24): SearchEntry[] {
  if (!q.trim()) return [];
  return all
    .map((e) => ({ e, s: scoreEntry(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
}
