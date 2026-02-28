import Parser from "rss-parser";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const parser = new Parser({
  timeout: 5000,
});

export async function collectSingleRSS(
  sourceName: string
): Promise<{ found: number; added: number }> {
  const source = await prisma.source.findUnique({
    where: { name: sourceName },
  });
  if (!source || !source.enabled) return { found: 0, added: 0 };

  const feed = await parser.parseURL(source.url);
  let found = 0;
  let added = 0;

  for (const item of feed.items) {
    const guid =
      item.guid ||
      item.link ||
      crypto.createHash("md5").update(item.title || "").digest("hex");

    try {
      await prisma.article.create({
        data: {
          externalId: `rss:${source.name}:${guid}`,
          title: item.title || "Untitled",
          url: item.link || source.url,
          content: item.contentSnippet || item.content || null,
          author: item.creator || null,
          sourceId: source.id,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        },
      });
      added++;
    } catch {
      // Duplicate — skip
    }
    found++;
  }

  return { found, added };
}

export async function collectRSS(): Promise<{
  found: number;
  added: number;
}> {
  const sources = await prisma.source.findMany({
    where: { type: "rss", enabled: true },
  });

  let totalFound = 0;
  let totalAdded = 0;

  // Fetch all RSS feeds in parallel
  const feedResults = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return { source, items: feed.items };
    })
  );

  for (const result of feedResults) {
    if (result.status !== "fulfilled") continue;
    const { source, items } = result.value;

    for (const item of items) {
      const guid =
        item.guid ||
        item.link ||
        crypto.createHash("md5").update(item.title || "").digest("hex");

      try {
        await prisma.article.create({
          data: {
            externalId: `rss:${source.name}:${guid}`,
            title: item.title || "Untitled",
            url: item.link || source.url,
            content: item.contentSnippet || item.content || null,
            author: item.creator || null,
            sourceId: source.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          },
        });
        totalAdded++;
      } catch {
        // Duplicate — skip
      }
      totalFound++;
    }
  }

  return { found: totalFound, added: totalAdded };
}
