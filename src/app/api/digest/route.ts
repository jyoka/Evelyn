import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/ai/digest";

export async function POST() {
  try {
    const result = await generateDigest();
    if (!result) {
      return NextResponse.json(
        { success: false, error: "No articles to generate digest from" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Digest generation failed:", err);
    return NextResponse.json(
      { success: false, error: "Digest generation failed" },
      { status: 500 }
    );
  }
}
