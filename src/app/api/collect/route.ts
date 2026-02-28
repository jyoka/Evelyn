import { NextResponse } from "next/server";
import { collectAll } from "@/lib/collectors";

export const maxDuration = 60;

export async function POST() {
  try {
    const results = await collectAll();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Collection failed:", err);
    return NextResponse.json(
      { success: false, error: "Collection failed" },
      { status: 500 }
    );
  }
}
