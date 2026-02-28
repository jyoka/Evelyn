import Parser from "rss-parser";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const parser = new Parser({
  timeout: 8000,
});

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
