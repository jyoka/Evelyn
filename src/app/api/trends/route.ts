import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";

export async function GET() {
  // Get category distribution from recent processed articles
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const articles = await prisma.article.findMany({
    where: {
      processed: true,
      collectedAt: { gte: sevenDaysAgo },
    },
    include: { source: true },
    orderBy: { relevance: "desc" },
  });

  // Category counts
  const categoryMap: Record<string, number> = {};
  for (const a of articles) {
    if (a.category) {
      categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
    }
  }
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Source counts
  const sourceMap: Record<string, number> = {};
  for (const a of articles) {
    const label = a.source.label;
    sourceMap[label] = (sourceMap[label] || 0) + 1;
  }
  const sources = Object.entries(sourceMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Extract trending tags
  const tagMap: Record<string, number> = {};
  for (const a of articles) {
    const tags = safeJsonParse<string[]>(a.tags, []);
    for (const tag of tags) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
  }
  const trendingTags = Object.entries(tagMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Recent digests
  const digests = await prisma.digest.findMany({
    orderBy: { date: "desc" },
    take: 7,
  });

  return NextResponse.json({
    totalArticles: articles.length,
    categories,
    sources,
    trendingTags,
    digests: digests.map((d) => ({
      date: d.date,
      trendingTopics: safeJsonParse(d.trendingTopics, []),
    })),
  });
}
