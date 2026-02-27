import { NextResponse } from "next/server";
import { processUnprocessedArticles } from "@/lib/ai/process";

export async function POST() {
  try {
    const result = await processUnprocessedArticles();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Processing failed:", err);
    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
