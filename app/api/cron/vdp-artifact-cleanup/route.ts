import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { printBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  return request.headers.get("authorization") === `Bearer ${secret}`
    || request.headers.get("x-vercel-cron-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const expiredBatches = await db.query.printBatches.findMany({
    where: and(
      eq(printBatches.app_id, "balikin_id"),
      isNotNull(printBatches.artifactUrl),
      lt(printBatches.artifactExpiresAt, new Date()),
    ),
    columns: { id: true, artifactUrl: true },
  });

  let deleted = 0;
  for (const batch of expiredBatches) {
    if (batch.artifactUrl) {
      await del(batch.artifactUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
      deleted += 1;
    }

    await db.update(printBatches)
      .set({
        artifactUrl: null,
        artifactSize: null,
        artifactExpiresAt: null,
      })
      .where(eq(printBatches.id, batch.id));
  }

  return NextResponse.json({ success: true, deleted, timestamp: new Date().toISOString() });
}
