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

function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
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

  // Fetch all queries in parallel with timeout
  const queryResults = await Promise.allSettled(
    queries.map(async (q) => {
      const res = await fetchWithTimeout(
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=20`
      );
      if (!res.ok) return [];
      const data: HNResponse = await res.json();
      return data.hits;
    })
  );

  const allHits: HNHit[] = [];
  for (const r of queryResults) {
    if (r.status === "fulfilled") allHits.push(...r.value);
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
