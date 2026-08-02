import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { lostLocationsReport, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientIP, getUserAgent } from "@/lib/blog-common";
import { generateFingerprint, getRateLimitHeaders, checkRateLimitByFingerprint } from "@/lib/rate-limit-enhanced";

/**
 * POST /api/blog/location-report - Submit a lost location report
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, locationName, locationType, cityName, lostItemType } = body;

    if (!postId || !locationName || !locationType || !cityName || !lostItemType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify post exists
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get fingerprint for rate limiting
    const clientIP = await getClientIP(req);
    const userAgent = getUserAgent(req);
    const fingerprint = generateFingerprint(clientIP, userAgent);

    // Rate limiting: max 5 reports per hour per fingerprint
    const rateLimitResult = await checkRateLimitByFingerprint(fingerprint, 'api');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak laporan. Silakan coba lagi nanti." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Create location report
    const report = await db.insert(lostLocationsReport).values({
      postId,
      locationName,
      locationType,
      cityName,
      lostItemType,
    }).returning();

    return NextResponse.json({
      success: true,
      report: report[0],
    });
  } catch (error) {
    console.error("Location report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
