import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const source = params.get("source");
  const search = params.get("search");
  const minRelevance = params.get("minRelevance");
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "20");

  const where: Record<string, unknown> = { processed: true };

  if (category) where.category = category;
  if (source) where.sourceId = parseInt(source);
  if (minRelevance) where.relevance = { gte: parseInt(minRelevance) };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
    delete where.processed;
    where.AND = [{ processed: true }];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { source: true },
      orderBy: { relevance: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
