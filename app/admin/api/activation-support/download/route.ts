import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs, stickerOrders, tagBundles, tags } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';
import { canUseAcrylicSupport, hasTrustedSupportRequest } from '@/lib/acrylic-support-policy';
import { redactAcrylicAuditNote, releaseAcrylicCard } from '@/lib/acrylic-recovery-service';
import { buildActivationCardsPdf } from '@/lib/vdp-manual-pdf';
import { getAppBaseUrl } from '@/lib/app-url';

export const dynamic = 'force-dynamic';
const APP_ID = 'balikin_id';
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' };
const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return jsonError('Unauthorized', 401);
  if (!canUseAcrylicSupport(session.user.division)) return jsonError('Forbidden', 403);
  if (!hasTrustedSupportRequest(request, getAppBaseUrl())) return jsonError('Origin atau Content-Type tidak tepercaya.', 403);
  let body: { tagId?: unknown; proofNote?: unknown; proofReviewed?: unknown };
  try { body = await request.json(); } catch { return jsonError('Request tidak valid.', 400); }
  if (typeof body.tagId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.tagId) || typeof body.proofNote !== 'string' || body.proofNote.trim().length < 16 || body.proofNote.trim().length > 500 || body.proofReviewed !== true) return jsonError('Konfirmasi pemeriksaan bukti dan catatan 16–500 karakter wajib diisi.', 400);
  const tagId = body.tagId;
  const proofNote = body.proofNote.trim();

  const [tag] = await db.select({
    id: tags.id, productType: tags.productType, ownerId: tags.ownerId, claimedAt: tags.claimedAt,
    batchId: tags.batchId, activationPinPlain: tags.activationPinPlain, serialNumber: tags.serialNumber,
    orderId: stickerOrders.id, paymentStatus: stickerOrders.paymentStatus,
  }).from(tags)
    .leftJoin(tagBundles, and(eq(tags.bundleId, tagBundles.id), eq(tagBundles.app_id, APP_ID)))
    .leftJoin(stickerOrders, and(eq(tagBundles.orderId, stickerOrders.id), eq(stickerOrders.app_id, APP_ID)))
    .where(and(eq(tags.id, tagId), eq(tags.app_id, APP_ID)))
    .limit(1);
  if (!tag) return jsonError('Tag tidak ditemukan.', 404);
  let release: Awaited<ReturnType<typeof releaseAcrylicCard<Buffer>>>;
  try {
    release = await releaseAcrylicCard<Buffer>({
    record: {
    appId: APP_ID, productType: tag.productType, ownerId: tag.ownerId, claimedAt: tag.claimedAt,
      orderId: tag.orderId, paymentStatus: tag.paymentStatus,
    batchId: tag.batchId, pin: tag.activationPinPlain,
    },
    writeAudit: async () => {
      // Audit is deliberately a hard prerequisite: never release a PIN if audit persistence fails.
      await db.insert(auditLogs).values({
    app_id: APP_ID, adminId: session.user.id, action: 'acrylic_activation_card_download',
    entityType: 'tag', entityId: tag.id,
    originalValue: { serialNumber: tag.serialNumber, orderId: tag.orderId, proofReviewed: true },
    newValue: { proofNote: redactAcrylicAuditNote(proofNote, tag.activationPinPlain!) },
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      });
    },
    buildPdf: () => buildActivationCardsPdf([{
    codeLabel: 'PIN AKTIVASI', code: tag.activationPinPlain!, scope: `Serial fisik: ${tag.serialNumber || '—'}`,
    activationUrl: `${getAppBaseUrl()}/activate/batch/${tag.batchId}`,
    }]),
    });
  } catch {
    return jsonError('Audit atau pembuatan kartu gagal; kartu tidak dirilis.', 503);
  }
  if (!release.ok) return jsonError(release.reason, 409);
  const pdf = release.pdf;
  return new NextResponse(new Uint8Array(pdf), { headers: { ...noStore, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="balikin-acrylic-support-card.pdf"' } });
}
