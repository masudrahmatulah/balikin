import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { nanoid } from 'nanoid';
import { BUNDLE_CONFIGS, type BundleType } from '@/lib/bundles';

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bundleType, quantity, batchSize } = body;

    if (!bundleType || !quantity || !batchSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bundleConfig = BUNDLE_CONFIGS[bundleType as BundleType];
    if (!bundleConfig) {
      return NextResponse.json(
        { error: 'Invalid bundle type' },
        { status: 400 }
      );
    }

    // Generate tags
    const createdTags: Array<{ slug: string; qrUrl: string }> = [];

    for (let i = 0; i < quantity; i++) {
      const batchNumber = batchSize + i;
      const slug = `${bundleType}-${batchNumber.toString().padStart(3, '0')}`;

      // Generate QR code URL
      const qrData = `https://balikin.online/p/${slug}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=${bundleConfig.qrColor.replace('#', '')}&bgcolor=${bundleConfig.qrBgColor.replace('#', '')}`;

      // Insert tag
      await db.insert(tags).values({
        app_id: 'balikin_id',
        slug,
        name: `${bundleConfig.name} #${batchNumber}`,
        bundleType: bundleType,
        autoActivateModule: bundleConfig.moduleType,
        productType: 'bundle',
        tier: 'premium',
        isVerified: true,
        status: 'normal',
        whatsappAlertsEnabled: true,
        hasTabTwoEnabled: true,
        welcomeShown: false,
        onboardingCompleted: false,
      });

      createdTags.push({ slug, qrUrl });
    }

    return NextResponse.json({
      success: true,
      tags: createdTags,
      bundleType,
      quantity,
    });
  } catch (error) {
    console.error('Error creating bundle tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
