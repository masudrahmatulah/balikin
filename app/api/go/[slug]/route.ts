import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

function formatPhone(input: string): string {
  let cleaned = input.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return cleaned;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text') || searchParams.get('m') || 'Halo, saya menemukan barang ini.';

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
    columns: { contactWhatsapp: true, slug: true },
  });

  if (!tag || !tag.contactWhatsapp) {
    return NextResponse.json({ error: 'Tag atau kontak tidak ditemukan' }, { status: 404 });
  }

  const cleanPhone = formatPhone(tag.contactWhatsapp);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

  // 302 redirect to WA - number never appears in page source / JS bundle
  return NextResponse.redirect(waUrl, 302);
}
