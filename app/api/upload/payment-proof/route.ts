import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { modulePurchaseOrders, stickerOrders } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10) * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const MAGIC_BYTES: Record<string, Uint8Array> = {
  'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
};

async function validateMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const expectedMagic = MAGIC_BYTES[file.type];
    if (!expectedMagic || buffer.length < expectedMagic.length) {
      return false;
    }
    return Array.from(expectedMagic).every((byte, i) => buffer[i] === byte);
  } catch {
    return false;
  }
}

function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().match(/\.[^.]+$/);
  return ext ? ext[0] : '';
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[Payment Proof Upload] BLOB_READ_WRITE_TOKEN belum dikonfigurasi.');
    return NextResponse.json({ error: 'Layanan upload belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = String(formData.get('orderId') || '').trim();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order pembayaran wajib dipilih.' }, { status: 400 });
    }

    const moduleOrder = await db.query.modulePurchaseOrders.findFirst({
      where: and(
        eq(modulePurchaseOrders.id, orderId),
        eq(modulePurchaseOrders.userId, session.user.id),
        eq(modulePurchaseOrders.app_id, 'balikin_id'),
      ),
      columns: { id: true, status: true },
    });
    const stickerOrder = await db.query.stickerOrders.findFirst({
      where: and(eq(stickerOrders.id, orderId), eq(stickerOrders.userId, session.user.id), eq(stickerOrders.app_id, 'balikin_id')),
      columns: { id: true, status: true, productType: true },
    });
    const validOrder = moduleOrder || stickerOrder;
    if (!validOrder || (moduleOrder ? moduleOrder.status !== 'pending_payment' : stickerOrder?.status !== 'pending_payment')) {
      return NextResponse.json({ error: 'Order pembayaran tidak valid.' }, { status: 403 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.' },
        { status: 400 }
      );
    }

    const isValidMagicBytes = await validateMagicBytes(file);
    if (!isValidMagicBytes) {
      return NextResponse.json(
        { error: 'File content does not match the declared file type.' },
        { status: 400 }
      );
    }

    const filename = `${session.user.id}/${validOrder.id}/${Date.now()}-${nanoid(8)}${ext}`;
    const blob = await put(`payment-proofs/${filename}`, file, {
      access: 'public',
      contentType: file.type,
    });

    if (stickerOrder) {
      await db.update(stickerOrders).set({ paymentProofUrl: blob.url, updatedAt: new Date() }).where(eq(stickerOrders.id, stickerOrder.id));
    }
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[Payment Proof Upload] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
