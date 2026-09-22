import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Layanan upload belum tersedia.' }, { status: 503 });

  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !ALLOWED.includes(file.type) || file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Logo harus JPG, PNG, atau WebP maksimal 2MB.' }, { status: 400 });
  }

  const blob = await put(`printable-logos/${session.user.id}/${Date.now()}-${nanoid(8)}`, file, {
    access: 'public',
    contentType: file.type,
  });
  return NextResponse.json({ url: blob.url });
}
