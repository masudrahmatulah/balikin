import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { auth } from '@/lib/auth';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { logError, ValidationError, NotFoundError, AppError } from '@/lib/error-handler';
import { BlogPostCreateSchema, BlogPostUpdateSchema, type BlogPostCreateInput } from '@/lib/validations';
import { validateSlug } from '@/lib/blog-validation';

// Cache frequently accessed data for 5 minutes
const getCachedPosts = unstable_cache(
  async () => {
    const posts = await db.query.blogPosts.findMany({
      where: and(isNull(blogPosts.deletedAt)),
      orderBy: [desc(blogPosts.createdAt)],
      limit: 50,
    });
    return posts;
  },
  ['blog-posts'],
  { revalidate: 300, tags: ['blog-posts'] }
);

const getCachedPostBySlug = unstable_cache(
  async (slug: string, publishedOnly = false) => {
    const where = publishedOnly
      ? and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt))
      : and(eq(blogPosts.slug, slug), isNull(blogPosts.deletedAt));

    const post = await db.query.blogPosts.findFirst({
      where,
    });
    return post;
  },
  ['blog-post-by-slug'],
  { revalidate: 300, tags: ['blog-posts'] }
);

async function getClientIP(request: NextRequest): Promise<string> {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const published = searchParams.get('published');

    if (slug) {
      // Get single post by slug using cache
      const post = await getCachedPostBySlug(slug, published === 'true');

      if (!post) {
        throw new NotFoundError('Artikel blog', slug);
      }

      return NextResponse.json(post);
    }

    // Get all posts using cache
    const posts = await getCachedPosts();

    // Remove sensitive data from public view
    const sanitizedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      coverImage: p.coverImage,
      content: p.content,
      modules: p.modules,
      authorName: p.authorName,
      authorAvatar: p.authorAvatar,
      reviewedBy: p.reviewedBy,
      reviewedByTitle: p.reviewedByTitle,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(sanitizedPosts);
  } catch (error) {
    logError(error, 'BlogPostGET');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil artikel' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const body = await req.json();

    // Zod validation
    const validationResult = BlogPostCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const data: BlogPostCreateInput = validationResult.data;

    // Additional slug validation
    const validatedSlug = validateSlug(data.slug);

    // Check if slug already exists
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, validatedSlug),
    });

    if (existing) {
      throw new ValidationError(
        'Slug sudah digunakan. Silakan gunakan slug lain.',
        'DUPLICATE_SLUG'
      );
    }

    // Get admin user info for author
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Handle scheduled publishing
    const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const isScheduled = scheduledDate && scheduledDate > new Date();

    const post = await db.insert(blogPosts).values({
      title: data.title,
      slug: validatedSlug,
      summary: data.summary,
      coverImage: data.coverImage || null,
      coverImageAlt: data.coverImage
        ? data.coverImageAlt || data.focusKeyword || data.title
        : null,
      content: data.content,
      modules: data.modules || [],
      authorName: data.authorName || 'Tim Penulis BALIKIN',
      authorAvatar: data.authorAvatar || null,
      authorId: session?.user?.id || null,
      reviewedBy: data.reviewedBy || null,
      reviewedByTitle: data.reviewedByTitle || null,
      reviewedById: data.reviewedBy ? session?.user?.id : null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || null,
      focusKeyword: data.focusKeyword || null,
      isPublished: data.isPublished === true && !isScheduled,
       publishedAt: data.isPublished === true && !isScheduled ? new Date() : null,
      scheduledAt: isScheduled ? scheduledDate : null,
    }).returning();

    return NextResponse.json(post[0], { status: 201 });
  } catch (error) {
    logError(error, 'BlogPostPOST');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat artikel' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const body = await req.json();
    const validationResult = BlogPostUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const { id, ...data } = validationResult.data;
    const existing = await db.query.blogPosts.findFirst({
      where: and(eq(blogPosts.id, id), isNull(blogPosts.deletedAt)),
    });
    if (!existing) throw new NotFoundError('Artikel blog', id);

    const nextScheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const isScheduled = Boolean(nextScheduledDate && nextScheduledDate > new Date());
    const isPublished = data.isPublished === true && !isScheduled;

    const [post] = await db.update(blogPosts).set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: validateSlug(data.slug) }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
      ...(data.coverImageAlt !== undefined && {
        coverImageAlt: data.coverImageAlt || data.focusKeyword || data.title || existing.coverImageAlt || null,
      }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.modules !== undefined && { modules: data.modules }),
      ...(data.authorName !== undefined && { authorName: data.authorName || 'Tim Penulis BALIKIN' }),
      ...(data.authorAvatar !== undefined && { authorAvatar: data.authorAvatar || null }),
      ...(data.reviewedBy !== undefined && { reviewedBy: data.reviewedBy || null }),
      ...(data.reviewedByTitle !== undefined && { reviewedByTitle: data.reviewedByTitle || null }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
      ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords || null }),
      ...(data.focusKeyword !== undefined && { focusKeyword: data.focusKeyword || null }),
      ...(data.isPublished !== undefined && {
        isPublished,
        publishedAt: isPublished ? (existing.publishedAt || new Date()) : null,
      }),
      ...(data.scheduledAt !== undefined && { scheduledAt: isScheduled ? nextScheduledDate : null }),
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, id)).returning();

    return NextResponse.json(post);
  } catch (error) {
    logError(error, 'BlogPostPUT');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui artikel' },
      { status: 500 }
    );
  }
}
