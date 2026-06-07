import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { setupGallerySubmissions, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientIP, getUserAgent } from "@/lib/blog-common";
import { generateFingerprint, getRateLimitHeaders, checkRateLimitByFingerprint } from "@/lib/rate-limit-enhanced";

/**
 * POST /api/blog/setup-gallery - Submit a setup gallery photo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, galleryId, userName, userEmail, photoUrl, description } = body;

    if (!postId || !galleryId || !userName || !photoUrl) {
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
    const fingerprint = generateFingerprint(clientIP, userAgent, { email: userEmail || 'anonymous' });

    // Rate limiting: max 3 submissions per day per fingerprint
    const rateLimitResult = await checkRateLimitByFingerprint(fingerprint, 'api');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak pengiriman. Silakan coba lagi besok." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Generate discount code
    const discountCode = `SETUP${Math.floor(Math.random() * 90) + 10}-${nanoid(4).toUpperCase()}`;

    // Create submission
    const submission = await db.insert(setupGallerySubmissions).values({
      postId,
      galleryId,
      userName,
      userEmail: userEmail || null,
      photoUrl,
      description: description || null,
      isApproved: false,
      discountCode,
    }).returning();

    return NextResponse.json({
      success: true,
      submission: submission[0],
    });
  } catch (error) {
    console.error("Setup gallery submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
