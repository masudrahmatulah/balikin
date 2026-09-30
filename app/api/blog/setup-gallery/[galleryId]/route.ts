import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { setupGallerySubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/blog/setup-gallery/[galleryId]?postId=xxx - Get approved photos for a gallery
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const { galleryId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId parameter" }, { status: 400 });
    }

    const photos = await db.query.setupGallerySubmissions.findMany({
      where: and(
        eq(setupGallerySubmissions.app_id, "balikin_id"),
        eq(setupGallerySubmissions.galleryId, galleryId),
        eq(setupGallerySubmissions.postId, postId),
        eq(setupGallerySubmissions.isApproved, true)
      ),
      columns: {
        id: true,
        app_id: true,
        userName: true,
        photoUrl: true,
        description: true,
        createdAt: true,
      },
      orderBy: [setupGallerySubmissions.createdAt],
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Setup gallery fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
