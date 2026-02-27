import { collectHackerNews } from "./hackernews";
import { collectRSS } from "./rss";
import { collectArxiv } from "./arxiv";

export interface CollectionResult {
  source: string;
  found: number;
  added: number;
  error?: string;
}

export async function collectAll(): Promise<CollectionResult[]> {
  const results: CollectionResult[] = [];

  const collectors = [
    { name: "HackerNews", fn: collectHackerNews },
    { name: "RSS Feeds", fn: collectRSS },
    { name: "ArXiv", fn: collectArxiv },
  ];

  const settled = await Promise.allSettled(
    collectors.map(async (c) => {
      const result = await c.fn();
      return { name: c.name, ...result };
    })
  );

  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push({
        source: s.value.name,
        found: s.value.found,
        added: s.value.added,
      });
    } else {
      results.push({
        source: "Unknown",
        found: 0,
        added: 0,
        error: String(s.reason),
      });
    }
  }

  return results;
}
