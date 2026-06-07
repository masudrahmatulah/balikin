import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logError, ValidationError, AppError } from '@/lib/error-handler';
import { checkBlogCommentRateLimit, generateFingerprint, getRateLimitHeaders } from '@/lib/rate-limit-enhanced';
import { BlogCommentSchema, type BlogCommentInput } from '@/lib/validations';
import { sendBlogCommentEmail } from '@/lib/email';
import { after } from 'next/server';
import { getClientIP, getUserAgent, isValidUUID } from '@/lib/blog-common';

export async function POST(req: NextRequest) {
  try {
    const clientIP = await getClientIP(req);
    const userAgent = getUserAgent(req);

    // Generate fingerprint for rate limiting
    const fingerprint = generateFingerprint(clientIP, userAgent);

    // Rate limiting with fingerprint
    const rateLimitResult = await checkBlogCommentRateLimit(fingerprint);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await req.json();

    // Zod validation
    const validationResult = BlogCommentSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const data: BlogCommentInput = validationResult.data;

    // Check if user is logged in
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || null;

    // Check if user has hero badge (from true story)
    let hasHeroBadge = false;
    if (userId) {
      const [userSubmission] = await db
        .select({ status: true })
        .from(db.schema.trueStorySubmissions)
        .where(eq(db.schema.trueStorySubmissions.userId, userId))
        .limit(1);

      hasHeroBadge = userSubmission?.status === 'winner_jacket';
    }

    const comment = await db.insert(blogComments).values({
      postId: data.postId,
      parentId: data.parentId || null,
      userId,
      name: data.name,
      commentText: data.commentText,
      whatsappNumber: data.whatsapp,
      isApproved: true,
      isGiveawayWinner: false,
      hasHeroBadge,
    }).returning();

    // Send email notification in background using after()
    after(async () => {
      try {
        const post = await db.query.blogPosts.findFirst({
          where: eq(blogPosts.id, data.postId),
        });

        if (post) {
          const admins = await db.query.user.findMany({
            where: eq(user.role, 'admin'),
            limit: 5,
          });

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const postUrl = `${appUrl}/blog/${post.slug}`;

          for (const admin of admins) {
            if (admin.email) {
              await sendBlogCommentEmail({
                email: admin.email,
                postTitle: post.title,
                commentAuthor: data.name,
                commentText: data.commentText,
                postUrl,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to send comment notification email:', error);
      }
    });

    return NextResponse.json(comment[0], { status: 201 });
  } catch (error) {
    logError(error, 'BlogCommentPOST');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim komentar' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const postId = searchParams.get('postId');

    if (!postId) {
      throw new ValidationError('Post ID diperlukan');
    }

    // Validate UUID format
    if (!isValidUUID(postId)) {
      throw new ValidationError('Format Post ID tidak valid');
    }

    const comments = await db.query.blogComments.findMany({
      where: eq(blogComments.postId, postId),
      orderBy: (table, { desc }) => desc(table.createdAt),
    });

    // Only return approved comments for public view
    const publicComments = comments.filter(c => c.isApproved);

    // Remove sensitive data from public view
    const sanitizedComments = publicComments.map(c => ({
      id: c.id,
      parentId: c.parentId,
      name: c.name,
      commentText: c.commentText,
      isGiveawayWinner: c.isGiveawayWinner,
      hasHeroBadge: c.hasHeroBadge,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(sanitizedComments);
  } catch (error) {
    logError(error, 'BlogCommentGET');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil komentar' },
      { status: 500 }
    );
  }
}
