import { NextResponse } from "next/server";
import { collectHackerNews } from "@/lib/collectors/hackernews";
import { collectSingleRSS } from "@/lib/collectors/rss";
import { collectArxiv } from "@/lib/collectors/arxiv";
import { ensureSources } from "@/lib/collectors";
import { prisma } from "@/lib/db";

export const maxDuration = 60;

const COLLECTORS: Record<string, () => Promise<{ found: number; added: number }>> = {
  hackernews: collectHackerNews,
  arxiv: collectArxiv,
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;

  try {
    if (source === "seed") {
      await ensureSources();
      return NextResponse.json({ success: true });
    }

    // Manual cleanup: delete old unprocessed articles (only when user explicitly triggers)
    if (source === "cleanup") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const deleted = await prisma.article.deleteMany({
        where: {
          collectedAt: { lt: todayStart },
          processed: false,
        },
      });
      return NextResponse.json({ success: true, deleted: deleted.count });
    }

    // "rss" returns list of RSS feed names for the client to call individually
    if (source === "rss") {
      const feeds = await prisma.source.findMany({
        where: { type: "rss", enabled: true },
        select: { name: true, label: true },
      });
      return NextResponse.json({ success: true, feeds });
    }

    // Check if it's a known collector
    const collector = COLLECTORS[source];
    if (collector) {
      const result = await collector();
      return NextResponse.json({ success: true, ...result });
    }

    // Otherwise try as an individual RSS feed name
    const result = await collectSingleRSS(source);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(`Collection failed for ${source}:`, err);
    return NextResponse.json(
      { success: false, error: `Collection failed for ${source}` },
      { status: 500 }
    );
  }
}
