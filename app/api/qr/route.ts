import { NextRequest, NextResponse } from "next/server";
import { generateCachedQRCode } from "./data-access";
import { isQRCodeError } from "@/lib/qrcode-generator";

export const runtime = "nodejs";

// Rate limiting: 50 requests per minute per IP
const RATE_LIMIT = {
  max: 50,
  window: 60 * 1000, // 1 minute
};

// In-memory rate limit store (for production, use Redis or Vercel KV)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if request is rate limited
 */
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

/**
 * Get client IP from request
 */
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
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: "Parameter text diperlukan" },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: "Text terlalu panjang (maksimal 2000 karakter)" },
        { status: 400 }
      );
    }

    const svg = await generateCachedQRCode(text);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, immutable", // 24 hours
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isQRCodeError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat QR code" },
      { status: 500 }
    );
  }
}