import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { globalSearch } from "@/lib/admin-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Global Search API Endpoint
 * GET /api/admin/search?q=query&type=all&limit=20
 *
 * Search across users, tags, and orders
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = await request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = (searchParams.get("type") as "user" | "tag" | "order" | "all") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Perform search
    const results = await globalSearch(query, { limit, type });

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
