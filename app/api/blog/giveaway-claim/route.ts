import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, giveawayClaims } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { logError, ValidationError, AppError } from '@/lib/error-handler';
import { checkBlogQuizRateLimit } from '@/lib/rate-limit';
import { GiveawayClaimSchema, type GiveawayClaimInput } from '@/lib/validations';
import { findQuizModule, gradeQuizAnswers } from '@/lib/blog-quiz';

async function getClientIP(request: NextRequest): Promise<string> {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = await getClientIP(req);

    // Rate limiting - stricter for quiz claims
    const rateLimitResult = await checkBlogQuizRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.',
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    const body = await req.json();

    // Zod validation
    const validationResult = GiveawayClaimSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const data: GiveawayClaimInput = validationResult.data;

    const post = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.id, data.postId),
        eq(blogPosts.app_id, 'balikin_id'),
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt),
      ),
      columns: { modules: true },
    });
    if (!post) throw new ValidationError('Artikel giveaway tidak ditemukan.');

    const quiz = findQuizModule(post.modules, data.quizId);
    if (!quiz) throw new ValidationError('Kuis giveaway tidak ditemukan atau belum valid.');

    const quizResult = gradeQuizAnswers(quiz, data.answers);
    if (!quizResult) throw new ValidationError('Jawaban tidak sesuai dengan kuis.');
    if (!quizResult.passed) {
      return NextResponse.json({
        error: 'Skor belum mencapai batas minimum untuk mengklaim hadiah.',
        score: quizResult.score,
        minScoreToWin: quiz.minScoreToWin,
      }, { status: 403 });
    }

    // Check if this user has already claimed for this quiz (by phone number)
    const existing = await db.query.giveawayClaims.findFirst({
      where: (table, { and, eq }) => and(
        eq(table.postId, data.postId),
        eq(table.quizId, data.quizId),
        eq(table.whatsappNumber, data.whatsappNumber)
      ),
    });

    if (existing) {
      throw new ValidationError(
        'Anda sudah pernah mengklaim hadiah untuk kuis ini',
        'DUPLICATE_CLAIM'
      );
    }

    const claim = await db.insert(giveawayClaims).values({
      postId: data.postId,
      quizId: data.quizId,
      fullName: data.fullName,
      whatsappNumber: data.whatsappNumber,
      shippingAddress: data.shippingAddress,
      score: quizResult.score,
      status: 'pending',
    }).returning();

    return NextResponse.json(
      { success: true, claimId: claim[0].id, score: quizResult.score },
      { status: 201 }
    );
  } catch (error) {
    logError(error, 'GiveawayClaimPOST');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim klaim' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const searchParams = await req.nextUrl.searchParams;
    const status = searchParams.get('status');

    let claims;
    if (status) {
      claims = await db.query.giveawayClaims.findMany({
        where: eq(giveawayClaims.status, status),
        orderBy: (table, { desc }) => desc(table.createdAt),
      });
    } else {
      claims = await db.query.giveawayClaims.findMany({
        orderBy: (table, { desc }) => desc(table.createdAt),
      });
    }

    return NextResponse.json(claims);
  } catch (error) {
    logError(error, 'GiveawayClaimGET');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data klaim' },
      { status: 500 }
    );
  }
}
