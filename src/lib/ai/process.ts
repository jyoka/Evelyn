import { prisma } from "@/lib/db";
import { anthropic } from "./client";
import { CATEGORIES } from "@/lib/constants";

interface ProcessedArticle {
  summary: string;
  category: string;
  relevance: number;
  tags: string[];
}

export async function processUnprocessedArticles(): Promise<{
  processed: number;
  errors: number;
}> {
  const articles = await prisma.article.findMany({
    where: { processed: false },
    include: { source: true },
    orderBy: { collectedAt: "desc" },
    take: 50,
  });

  let processed = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Analyze this AI/ML article and return ONLY valid JSON (no markdown fences):

{
  "summary": "2-3 sentence summary focusing on what's new and why it matters",
  "category": "exactly one of: ${CATEGORIES.join(", ")}",
  "relevance": <integer 1-10, where 10 = groundbreaking for AI practitioners>,
  "tags": ["up to 5 keyword tags"]
}

Title: ${article.title}
Source: ${article.source.label}
Content: ${article.content?.slice(0, 2000) || "No content available — analyze based on title only."}`,
          },
        ],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Parse JSON — handle possible markdown code fences
      const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const result: ProcessedArticle = JSON.parse(jsonStr);

      await prisma.article.update({
        where: { id: article.id },
        data: {
          summary: result.summary,
          category: result.category,
          relevance: Math.min(10, Math.max(1, result.relevance)),
          tags: JSON.stringify(result.tags),
          processed: true,
          processedAt: new Date(),
        },
      });

      processed++;
    } catch (err) {
      console.error(`Failed to process article ${article.id}:`, err);
      errors++;
    }
  }

  return { processed, errors };
}
