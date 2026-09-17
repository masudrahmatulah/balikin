import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10) * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const MAGIC_BYTES: Record<string, Uint8Array> = {
  'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
};

async function validateMagicBytes(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const expectedMagic = MAGIC_BYTES[file.type];
  if (!expectedMagic) return false;
  return bytes.slice(0, expectedMagic.length).every((byte, i) => byte === expectedMagic[i]);
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

  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken && process.env.NODE_ENV === 'production') {
      console.error('[Custom Backside Upload] BLOB_READ_WRITE_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Penyimpanan gambar belum dikonfigurasi. Hubungi administrator.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const file = fileEntry instanceof File ? fileEntry : null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

    // Hasil cropper selalu JPEG, tetapi gunakan MIME sebagai fallback jika
    // browser tidak mengirimkan nama file pada multipart request.
    const ext = getFileExtension(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
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

    const filename = `${session.user.id}/${Date.now()}-${nanoid(8)}${ext}`;

    // Local development fallback only. Vercel production must use Blob because
    // its filesystem is ephemeral and cannot persist uploaded images.
    if (!blobToken) {
      const relativePath = path.join('backside-custom', filename);
      const absDir = path.join(process.cwd(), 'public', 'uploads', 'backside-custom', session.user.id);
      await mkdir(absDir, { recursive: true });
      await writeFile(path.join(absDir, path.basename(filename)), Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ url: `/uploads/${relativePath}` });
    }

    const blob = await put(`backside-custom/${filename}`, file, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[Custom Backside Upload] Failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
