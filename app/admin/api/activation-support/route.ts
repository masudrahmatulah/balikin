import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';
import { canUseAcrylicSupport } from '@/lib/acrylic-support-policy';

export const dynamic = 'force-dynamic';
const APP_ID = 'balikin_id';
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' };
const isAcrylic = (value: string) => /acrylic|akrilik/i.test(value);

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  if (!canUseAcrylicSupport(session.user.division)) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStore });
  const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';
  if (query.length < 3 || query.length > 100) return NextResponse.json({ error: 'Masukkan serial tepat atau UUID pesanan.' }, { status: 400, headers: noStore });

  const isOrderId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);
  const rows = await db.select({
    id: tags.id, serialNumber: tags.serialNumber, productType: tags.productType,
    status: tags.status, ownerId: tags.ownerId, claimedAt: tags.claimedAt,
    batchId: tags.batchId, orderId: stickerOrders.id,
    paymentStatus: stickerOrders.paymentStatus, recipientName: stickerOrders.recipientName,
  }).from(tags)
    .leftJoin(tagBundles, and(eq(tags.bundleId, tagBundles.id), eq(tagBundles.app_id, APP_ID)))
    .leftJoin(stickerOrders, and(eq(tagBundles.orderId, stickerOrders.id), eq(stickerOrders.app_id, APP_ID)))
    .where(and(
      eq(tags.app_id, APP_ID),
      isOrderId ? eq(stickerOrders.id, query) : eq(tags.serialNumber, query),
    ))
    .limit(50);

  const results = rows.filter(row => isAcrylic(row.productType)).map((row) => {
    const claimed = Boolean(row.ownerId || row.claimedAt);
    const recoverable = Boolean(row.orderId && row.paymentStatus === 'paid' && !claimed && row.batchId);
    const blockReason = recoverable ? null
      : !row.orderId ? 'Pesanan pembelian belum dapat dipetakan. Eskalasi untuk verifikasi bukti pembelian/reseller.'
        : row.paymentStatus !== 'paid' ? 'Pembayaran belum terverifikasi lunas. Eskalasi ke verifikasi pesanan.'
          : claimed ? 'Tag sudah diklaim; pemulihan mandiri diblokir.'
            : 'Batch aktivasi tidak tersedia. Eskalasi ke tim operasional.';
    return {
      id: row.id, serialNumber: row.serialNumber, productType: row.productType, status: row.status,
      claimed, orderId: row.orderId, paymentStatus: row.paymentStatus, recipientName: row.recipientName,
      recoverable, blockReason,
    };
  });
  return NextResponse.json({ results }, { headers: noStore });
}
