import { cache } from 'react';
import { db } from '@/db';
import { stickerSheets } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

const APP_ID = 'balikin_id';

// Deliberately excludes activationPinPlain/Hash - the list view never ships the PIN to the
// client. Admins reveal it on demand via revealStickerPin() in actions.ts, which is audited.
async function getStickerSheetsCore() {
  const sheets = await db.query.stickerSheets.findMany({
    where: eq(stickerSheets.app_id, APP_ID),
    orderBy: [desc(stickerSheets.createdAt)],
    columns: {
      id: true,
      sheetCode: true,
      packageType: true,
      status: true,
      claimedAt: true,
      createdAt: true,
    },
    with: {
      batch: {
        columns: { batchNumber: true, serialNumberRange: true },
      },
      owner: {
        columns: { name: true, email: true },
      },
      tags: {
        columns: { id: true, slug: true, serialNumber: true, name: true, status: true },
        orderBy: (tags, { asc }) => [asc(tags.slug)],
      },
    },
  });

  return sheets;
}

export const getStickerSheets = cache(getStickerSheetsCore);

async function getStickerSheetsStatsCore() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${stickerSheets.status} = 'active')`,
      inactive: sql<number>`count(*) filter (where ${stickerSheets.status} = 'inactive')`,
    })
    .from(stickerSheets)
    .where(eq(stickerSheets.app_id, APP_ID));

  return row;
}

export const getStickerSheetsStats = cache(getStickerSheetsStatsCore);
