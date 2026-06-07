import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { BlogOGImageTemplate } from '@/components/blog/og-image-template';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const size = {
  width: 1200,
  height: 630,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = await req.nextUrl;
    const title = searchParams.get('title') || 'Blog BALIKIN';
    const summary = searchParams.get('summary') || '';
    const author = searchParams.get('author') || 'Tim Penulis BALIKIN';
    const coverImage = searchParams.get('cover');

    const element = BlogOGImageTemplate({
      title,
      summary,
      author,
      coverImage,
    });

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
    });
  } catch (error) {
    console.error('OG Image error:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
