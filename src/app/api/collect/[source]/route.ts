import { NextResponse } from "next/server";
import { collectHackerNews } from "@/lib/collectors/hackernews";
import { collectRSS } from "@/lib/collectors/rss";
import { collectArxiv } from "@/lib/collectors/arxiv";
import { ensureSources } from "@/lib/collectors";

export const maxDuration = 60;

const COLLECTORS: Record<string, () => Promise<{ found: number; added: number }>> = {
  hackernews: collectHackerNews,
  rss: collectRSS,
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

    const collector = COLLECTORS[source];
    if (!collector) {
      return NextResponse.json(
        { success: false, error: `Unknown source: ${source}` },
        { status: 400 }
      );
    }

    const result = await collector();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(`Collection failed for ${source}:`, err);
    return NextResponse.json(
      { success: false, error: `Collection failed for ${source}` },
      { status: 500 }
    );
  }
}
