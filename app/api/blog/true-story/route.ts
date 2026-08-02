import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { trueStorySubmissions, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { logError, ValidationError, AppError } from '@/lib/error-handler';
import { checkBlogStoryRateLimit } from '@/lib/rate-limit';
import { TrueStorySubmissionSchema, type TrueStorySubmissionInput } from '@/lib/validations';
import { sendBlogTrueStorySubmissionEmail } from '@/lib/email';
import { after } from 'next/server';

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

    // Rate limiting - strictest for story submissions (physical goods)
    const rateLimitResult = await checkBlogStoryRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak pengiriman. Silakan tunggu beberapa saat.',
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
    const validationResult = TrueStorySubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
      throw new ValidationError(`Validasi gagal: ${errorMessages}`);
    }

    const data: TrueStorySubmissionInput = validationResult.data;

    // Check if user is logged in
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id || null;

    // Validate that the Balikin Tag exists
    const tagExists = await db.query.tags.findFirst({
      where: eq(db.schema.tags.slug, data.balikinTagId),
    });

    if (!tagExists) {
      throw new ValidationError(
        'ID Tag BALIKIN tidak ditemukan. Pastikan ID Tag yang Anda masukkan benar.',
        'INVALID_TAG'
      );
    }

    const submission = await db.insert(trueStorySubmissions).values({
      fullName: data.fullName,
      whatsappNumber: data.whatsappNumber,
      balikinTagId: data.balikinTagId,
      storyTitle: data.storyTitle,
      storyText: data.storyText,
      videoUrl: data.videoUrl,
      jacketSize: data.jacketSize,
      shippingAddress: data.shippingAddress,
      status: 'pending',
      userId,
    }).returning();

    // Send email notification to admins in background using after()
    after(async () => {
      try {
        const admins = await db.query.user.findMany({
          where: eq(user.role, 'admin'),
          limit: 5,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const reviewUrl = `${appUrl}/admin/blog/true-stories`;

        for (const admin of admins) {
          if (admin.email) {
            await sendBlogTrueStorySubmissionEmail({
              adminEmail: admin.email,
              submitterName: data.fullName,
              storyTitle: data.storyTitle,
              videoUrl: data.videoUrl,
              reviewUrl,
            });
          }
        }
      } catch (error) {
        console.error('Failed to send true story notification email:', error);
      }
    });

    return NextResponse.json(
      { success: true, submissionId: submission[0].id },
      { status: 201 }
    );
  } catch (error) {
    logError(error, 'TrueStorySubmissionPOST');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim kisah' },
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

    let submissions;
    if (status) {
      submissions = await db.query.trueStorySubmissions.findMany({
        where: eq(trueStorySubmissions.status, status),
        orderBy: (table, { desc }) => desc(table.createdAt),
      });
    } else {
      submissions = await db.query.trueStorySubmissions.findMany({
        orderBy: (table, { desc }) => desc(table.createdAt),
      });
    }

    return NextResponse.json(submissions);
  } catch (error) {
    logError(error, 'TrueStorySubmissionGET');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kisah' },
      { status: 500 }
    );
  }
}
