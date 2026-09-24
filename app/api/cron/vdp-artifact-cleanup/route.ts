import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { printBatches } from "@/db/schema";
import { deleteR2Object } from '@/lib/r2-storage';

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
      if (batch.artifactUrl.includes('.blob.vercel-storage.com')) {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (token) {
          await fetch(batch.artifactUrl, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else {
        const key = new URL(batch.artifactUrl).pathname.replace(/^\//, '');
        await deleteR2Object(key, true);
      }
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
