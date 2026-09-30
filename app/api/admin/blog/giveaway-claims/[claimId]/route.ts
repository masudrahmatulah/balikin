import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { giveawayClaims, blogPosts, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { logError, ValidationError, AppError, NotFoundError } from '@/lib/error-handler';
import { sendGiveawayWinnerNotification, sendGiveawayShippedNotification } from '@/lib/whatsapp';
import { sendBlogGiveawayWinnerEmail } from '@/lib/email';
import { after } from 'next/server';

interface GiveawayClaimUpdateInput {
  status: 'pending' | 'approved' | 'shipped' | 'rejected';
  trackingNumber?: string;
  notes?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const { claimId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(claimId)) {
      throw new ValidationError('Format Claim ID tidak valid');
    }

    const body = await req.json() as GiveawayClaimUpdateInput;

    // Validate status
    const validStatuses = ['pending', 'approved', 'shipped', 'rejected'];
    if (!body.status || !validStatuses.includes(body.status)) {
      throw new ValidationError('Status tidak valid. Harus: pending, approved, shipped, atau rejected');
    }

    // Get the existing claim
    const existingClaim = await db.query.giveawayClaims.findFirst({
      where: and(
        eq(giveawayClaims.id, claimId),
        eq(giveawayClaims.app_id, 'balikin_id')
      ),
    });

    if (!existingClaim) {
      throw new NotFoundError('Klaim giveaway', claimId);
    }

    // Get the post for title
    const post = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.id, existingClaim.postId),
        eq(blogPosts.app_id, 'balikin_id')
      ),
    });

    // Update the claim
    const updated = await db.update(giveawayClaims)
      .set({
        status: body.status,
        trackingNumber: body.trackingNumber || null,
        notes: body.notes || null,
        processedBy: session.user.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(giveawayClaims.id, claimId),
        eq(giveawayClaims.app_id, 'balikin_id')
      ))
      .returning();

    const claim = updated[0];

    // Send notifications in background using after()
    after(async () => {
      try {
        if (body.status === 'approved' && post) {
          // Send both email and WhatsApp
          await Promise.all([
            sendBlogGiveawayWinnerEmail({
              email: claim.whatsappNumber, // Using WhatsApp as email identifier
              fullName: claim.fullName,
              postTitle: post.title,
              trackingNumber: claim.trackingNumber || undefined,
            }),
            sendGiveawayWinnerNotification({
              phoneNumber: claim.whatsappNumber,
              fullName: claim.fullName,
              postTitle: post.title,
              trackingNumber: claim.trackingNumber || undefined,
            }),
          ]);
        } else if (body.status === 'shipped' && post && claim.trackingNumber) {
          // Send shipped notification
          await sendGiveawayShippedNotification({
            phoneNumber: claim.whatsappNumber,
            fullName: claim.fullName,
            postTitle: post.title,
            trackingNumber: claim.trackingNumber,
          });
        }
      } catch (error) {
        console.error('Failed to send giveaway notification:', error);
      }
    });

    return NextResponse.json(claim);
  } catch (error) {
    logError(error, 'GiveawayClaimUpdate');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate klaim' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const { claimId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(claimId)) {
      throw new ValidationError('Format Claim ID tidak valid');
    }

    await db.delete(giveawayClaims).where(and(
      eq(giveawayClaims.id, claimId),
      eq(giveawayClaims.app_id, 'balikin_id')
    ));

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'GiveawayClaimDelete');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus klaim' },
      { status: 500 }
    );
  }
}
