import { prisma } from "@/lib/db";
import { AI_KEYWORDS } from "@/lib/constants";

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  author: string;
  created_at: string;
  points: number;
  story_text?: string | null;
}

interface HNResponse {
  hits: HNHit[];
}

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function collectHackerNews(): Promise<{
  found: number;
  added: number;
}> {
  const source = await prisma.source.findUnique({
    where: { name: "hackernews" },
  });
  if (!source || !source.enabled) return { found: 0, added: 0 };

  const queries = ["AI agent", "LLM", "machine learning", "artificial intelligence"];
  const allHits: HNHit[] = [];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=20`
      );
      if (!res.ok) continue;
      const data: HNResponse = await res.json();
      allHits.push(...data.hits);
    } catch {
      // Skip failed queries
    }
  }

  // Deduplicate by objectID and filter
  const seen = new Set<string>();
  const unique = allHits.filter((h) => {
    if (seen.has(h.objectID)) return false;
    seen.add(h.objectID);
    return h.title && isAIRelated(h.title) && h.points >= 3;
  });

  let added = 0;
  for (const hit of unique) {
    try {
      await prisma.article.create({
        data: {
          externalId: `hn:${hit.objectID}`,
          title: hit.title,
          url:
            hit.url ||
            `https://news.ycombinator.com/item?id=${hit.objectID}`,
          content: hit.story_text || null,
          author: hit.author,
          sourceId: source.id,
          publishedAt: new Date(hit.created_at),
        },
      });
      added++;
    } catch {
      // Duplicate — skip
    }
  }

  return { found: unique.length, added };
}
