import { NextResponse } from "next/server";
import { processBatch } from "@/lib/ai/process";

export const maxDuration = 60;

export async function POST() {
  try {
    const result = await processBatch();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Processing failed:", err);
    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
