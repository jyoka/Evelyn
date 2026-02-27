import { prisma } from "@/lib/db";
import { anthropic } from "./client";

interface DigestResult {
  briefing: string;
  topInsights: string[];
  trendingTopics: string[];
}

export async function generateDigest(): Promise<DigestResult | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get top processed articles from the last 3 days
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const articles = await prisma.article.findMany({
    where: {
      processed: true,
      collectedAt: { gte: threeDaysAgo },
    },
    include: { source: true },
    orderBy: { relevance: "desc" },
    take: 20,
  });

  if (articles.length === 0) return null;

  const articleList = articles
    .map(
      (a, i) =>
        `${i + 1}. [${a.source.label}] ${a.title}\n   Summary: ${a.summary || "N/A"}\n   Relevance: ${a.relevance}/10\n   Category: ${a.category || "Unknown"}`
    )
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an AI industry analyst writing a daily briefing. Based on these top AI/ML stories, produce a JSON response (no markdown fences):

{
  "briefing": "A compelling 3-4 paragraph narrative that opens with the biggest story, connects themes, highlights what practitioners should watch, and ends with a forward-looking note. Write in a professional but engaging tone.",
  "topInsights": ["5 key takeaways as short bullet points"],
  "trendingTopics": ["5-8 trending topic names (2-4 words each)"]
}

Today's top stories:

${articleList}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  const result: DigestResult = JSON.parse(jsonStr);

  // Upsert today's digest
  await prisma.digest.upsert({
    where: { date: today },
    update: {
      briefing: result.briefing,
      topInsights: JSON.stringify(result.topInsights),
      trendingTopics: JSON.stringify(result.trendingTopics),
    },
    create: {
      date: today,
      briefing: result.briefing,
      topInsights: JSON.stringify(result.topInsights),
      trendingTopics: JSON.stringify(result.trendingTopics),
    },
  });

  return result;
}
