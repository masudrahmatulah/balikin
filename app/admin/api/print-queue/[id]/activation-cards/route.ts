import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { printBatches, printQueue, stickerSheets, tags } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';
import { getDefaultDivision, hasPermission } from '@/lib/admin-divisions';
import { getAppBaseUrl } from '@/lib/app-url';
import { buildActivationCardsPdf, type ActivationCardData } from '@/lib/vdp-manual-pdf';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(session.user.division || getDefaultDivision(), 'vdp_batch_download')) {
      return NextResponse.json({ error: 'Tidak memiliki izin mengunduh kartu aktivasi.' }, { status: 403 });
    }

    const { id } = await params;
    const queueItem = await db.query.printQueue.findFirst({
      where: and(eq(printQueue.id, id), eq(printQueue.app_id, 'balikin_id')),
      columns: { batchId: true, batchName: true },
    });
    if (!queueItem) return NextResponse.json({ error: 'Item Print Queue tidak ditemukan.' }, { status: 404 });

    const batch = await db.query.printBatches.findFirst({
      where: and(eq(printBatches.id, queueItem.batchId), eq(printBatches.app_id, 'balikin_id')),
      columns: { id: true, generationConfig: true },
    });
    if (!batch) return NextResponse.json({ error: 'Batch tidak ditemukan.' }, { status: 404 });
    if (!batch.generationConfig) {
      return NextResponse.json({ error: 'Batch legacy tidak didukung: data konfigurasi VDP tidak tersedia untuk membuat ulang kartu dengan aman.' }, { status: 409 });
    }

    const baseUrl = getAppBaseUrl();
    const activationUrl = `${baseUrl}/activate/batch/${batch.id}`;
    const sheets = await db.query.stickerSheets.findMany({
      where: and(eq(stickerSheets.batchId, batch.id), eq(stickerSheets.app_id, 'balikin_id')),
      columns: { id: true, sheetCode: true, activationPinPlain: true },
      orderBy: [asc(stickerSheets.sheetCode)],
    });

    let cards: ActivationCardData[];
    if (sheets.length > 0) {
      const batchTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batch.id), eq(tags.app_id, 'balikin_id')),
        columns: { sheetId: true },
      });
      if (sheets.some((sheet) => !sheet.activationPinPlain?.trim())) {
        return NextResponse.json({ error: 'PIN master tidak tersedia untuk satu atau beberapa sheet. Periksa data PIN sebelum mencetak ulang.' }, { status: 409 });
      }
      cards = sheets.map((sheet) => ({
        codeLabel: 'PIN MASTER SHEET',
        code: sheet.activationPinPlain!,
        scope: `${sheet.sheetCode} · ${batchTags.filter((tag) => tag.sheetId === sheet.id).length} QR dalam satu sheet`,
        activationUrl,
      }));
    } else {
      const batchTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batch.id), eq(tags.app_id, 'balikin_id')),
        columns: { slug: true, serialNumber: true, activationPinPlain: true },
        orderBy: [asc(tags.serialNumber)],
      });
      if (batchTags.length === 0) return NextResponse.json({ error: 'Tidak ada tag yang terkait dengan batch ini.' }, { status: 404 });
      if (batchTags.some((tag) => !tag.activationPinPlain?.trim())) {
        return NextResponse.json({ error: 'PIN aktivasi tidak tersedia untuk satu atau beberapa tag. Periksa data PIN sebelum mencetak ulang.' }, { status: 409 });
      }
      cards = batchTags.map((tag) => ({
        codeLabel: 'PIN TAG',
        code: tag.activationPinPlain!,
        scope: `${tag.serialNumber || tag.slug} · 1 tag`,
        activationUrl,
      }));
    }

    const pdf = await buildActivationCardsPdf(cards);
    const filename = `${queueItem.batchName}-kartu-aktivasi.pdf`.replace(/[^a-zA-Z0-9._-]/g, '-');
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat kartu aktivasi. Silakan coba lagi atau periksa data batch.' }, { status: 500 });
  }
}
