import { collectHackerNews } from "./hackernews";
import { collectRSS } from "./rss";
import { collectArxiv } from "./arxiv";
import { prisma } from "@/lib/db";
import { DEFAULT_SOURCES } from "@/lib/constants";

export interface CollectionResult {
  source: string;
  found: number;
  added: number;
  error?: string;
}

async function ensureSources() {
  const count = await prisma.source.count();
  if (count > 0) return;
  for (const source of DEFAULT_SOURCES) {
    await prisma.source.upsert({
      where: { name: source.name },
      update: {},
      create: source,
    });
  }
}

export async function collectAll(): Promise<CollectionResult[]> {
  await ensureSources();

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
