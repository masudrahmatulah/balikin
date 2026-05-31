import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { cachedGlobalSearch } from "./data-access";

export const runtime = "nodejs";

// Rate limiting: 10 requests per minute per IP
const RATE_LIMIT = {
  max: 10,
  window: 60 * 1000, // 1 minute
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.window,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT.max) {
    return true;
  }

  record.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);

  if (isRateLimited(clientIP)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan, silakan coba lagi nanti" },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = (searchParams.get("type") as "user" | "tag" | "order" | "all") || "all";
    const limitParam = searchParams.get("limit");

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20;

    const results = await cachedGlobalSearch(query, { limit, type });

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mencari" },
      { status: 500 }
    );
  }
}