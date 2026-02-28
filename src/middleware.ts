import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect POST endpoints (mutation routes)
  if (request.method !== "POST") return NextResponse.next();

  const secret = process.env.EVELYN_API_SECRET;

  // If no secret is configured, skip auth (local dev convenience)
  if (!secret) return NextResponse.next();

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
