import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logError, ValidationError, AppError, NotFoundError } from '@/lib/error-handler';
import {
  submitPostForReview,
  approvePost,
  rejectPost,
  requestChanges,
  getPostWorkflowStatus,
} from '@/lib/blog-workflow';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await req.json();
    const { action, rejectionReason } = body;

    switch (action) {
      case 'submit_for_review':
        await submitPostForReview(postId);
        break;

      case 'approve':
        await approvePost(postId);
        break;

      case 'reject':
        if (!rejectionReason) {
          throw new ValidationError('Rejection reason is required');
        }
        await rejectPost(postId, rejectionReason);
        break;

      case 'request_changes':
        if (!rejectionReason) {
          throw new ValidationError('Feedback is required for change requests');
        }
        await requestChanges(postId, rejectionReason);
        break;

      default:
        throw new ValidationError('Invalid action');
    }

    // Get updated workflow status
    const status = await getPostWorkflowStatus(postId);

    return NextResponse.json({
      success: true,
      workflowStatus: status,
    });
  } catch (error) {
    logError(error, 'BlogPostWorkflow');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses workflow' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const status = await getPostWorkflowStatus(postId);

    return NextResponse.json(status);
  } catch (error) {
    logError(error, 'BlogPostWorkflowGetStatus');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil status workflow' },
      { status: 500 }
    );
  }
}
