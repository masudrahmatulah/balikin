import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { giveawayClaims } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';
import { logError, ValidationError, AppError } from '@/lib/error-handler';
import { checkBlogQuizRateLimit } from '@/lib/rate-limit';
import { GiveawayClaimSchema, type GiveawayClaimInput } from '@/lib/validations';

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
      const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const data: GiveawayClaimInput = validationResult.data;

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
      score: data.score,
      status: 'pending',
    }).returning();

    return NextResponse.json(
      { success: true, claimId: claim[0].id },
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
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
