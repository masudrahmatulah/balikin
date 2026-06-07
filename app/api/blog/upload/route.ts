import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { uploadBlogImage, generateBlogImageFilename, getImageExtension, isValidImageFile } from '@/lib/blob-storage';
import { logError, AppError, ValidationError } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'cover' | 'gallery' | 'author' | null;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!type || !['cover', 'gallery', 'author'].includes(type)) {
      throw new ValidationError('Invalid image type. Must be cover, gallery, or author');
    }

    if (!isValidImageFile(file)) {
      throw new ValidationError('Invalid file. Must be JPG, PNG, WebP, or GIF under 5MB');
    }

    const extension = getImageExtension(file.type);
    const filename = generateBlogImageFilename(type, extension);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBlogImage(buffer, filename, file.type);

    return NextResponse.json({
      url: result.url,
      downloadUrl: result.downloadUrl,
      size: result.size,
      contentType: result.contentType,
    });
  } catch (error) {
    logError(error, 'BlogImageUpload');

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Next.js 16 doesn't use config export for route handlers
// bodyParser: false is now default
