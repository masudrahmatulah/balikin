import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationLogs, scanLogs, tags, user } from '@/db/schema';
import { sendScanAlertEmail } from '@/lib/email';
import { isAcrylicProduct, isFreeProduct } from '@/lib/product';
import {
  sendScanAlertWhatsApp,
  type WhatsAppChannel,
  type WhatsAppSendResult,
} from '@/lib/whatsapp';

const ALERT_THROTTLE_MS = 15 * 60 * 1000;

interface ScanAlertContext {
  tag: typeof tags.$inferSelect;
  owner: typeof user.$inferSelect;
  scanLog: typeof scanLogs.$inferSelect;
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    'http://localhost:3000'
  );
}

function buildTagDashboardUrl(slug: string): string {
  return `${getAppBaseUrl()}/dashboard/tag/${slug}`;
}

function canSendByThrottle(lastAlertSentAt: Date | null): boolean {
  if (!lastAlertSentAt) {
    return true;
  }

  return Date.now() - new Date(lastAlertSentAt).getTime() >= ALERT_THROTTLE_MS;
}

function getPreferredWhatsAppChannel(tag: typeof tags.$inferSelect): WhatsAppChannel {
  return isAcrylicProduct(tag) ? 'priority' : 'standard';
}

async function loadScanAlertContext(tagId: string, scanLogId: string): Promise<ScanAlertContext | null> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag || tag.status !== 'lost' || !tag.ownerId) {
    return null;
  }

  const owner = await db.query.user.findFirst({
    where: eq(user.id, tag.ownerId),
  });

  if (!owner?.email) {
    console.warn(`[Scan Alert] Owner not found or missing email for tag ${tag.slug}`);
    return null;
  }

  const scanLog = await db.query.scanLogs.findFirst({
    where: and(eq(scanLogs.id, scanLogId), eq(scanLogs.tagId, tagId)),
  });

  if (!scanLog) {
    console.warn(`[Scan Alert] Scan log ${scanLogId} not found for tag ${tag.slug}`);
    return null;
  }

  return {
    tag,
    owner,
    scanLog,
  };
}

async function createNotificationLog(params: {
  tagId: string;
  scanLogId: string;
  result: WhatsAppSendResult;
}): Promise<void> {
  await db.insert(notificationLogs).values({
    tagId: params.tagId,
    scanLogId: params.scanLogId,
    channel: params.result.channel,
    provider: params.result.provider,
    status: params.result.success ? 'sent' : 'failed',
    errorMessage: params.result.error || null,
    providerMessageId: params.result.providerMessageId || null,
    sentAt: params.result.success ? new Date() : null,
  });
}

async function sendWhatsAppWithFallback(context: ScanAlertContext, tagUrl: string): Promise<boolean> {
  if (!context.tag.contactWhatsapp) {
    console.warn(`[Scan Alert] WhatsApp skipped for tag ${context.tag.slug} because contactWhatsapp is empty`);
    return false;
  }

  const primaryChannel = getPreferredWhatsAppChannel(context.tag);
  const fallbackChannel: WhatsAppChannel | null = primaryChannel === 'priority' ? 'standard' : null;

  const baseOptions = {
    phoneNumber: context.tag.contactWhatsapp,
    tagName: context.tag.name,
    scannedAt: context.scanLog.scannedAt,
    city: context.scanLog.city,
    deviceInfo: context.scanLog.deviceInfo,
    tagUrl,
  };

  const primaryResult = await sendScanAlertWhatsApp({
    ...baseOptions,
    channel: primaryChannel,
  });

  await createNotificationLog({
    tagId: context.tag.id,
    scanLogId: context.scanLog.id,
    result: primaryResult,
  });

  if (primaryResult.success) {
    console.log(`[Scan Alert] WhatsApp sent for tag ${context.tag.slug} via ${primaryResult.channel}/${primaryResult.provider}`);
    return true;
  }

  console.error(`[Scan Alert] WhatsApp failed for tag ${context.tag.slug} via ${primaryResult.channel}/${primaryResult.provider}: ${primaryResult.error}`);

  if (!fallbackChannel) {
    return false;
  }

  const fallbackResult = await sendScanAlertWhatsApp({
    ...baseOptions,
    channel: fallbackChannel,
  });

  await createNotificationLog({
    tagId: context.tag.id,
    scanLogId: context.scanLog.id,
    result: fallbackResult,
  });

  if (fallbackResult.success) {
    console.log(`[Scan Alert] WhatsApp fallback sent for tag ${context.tag.slug} via ${fallbackResult.channel}/${fallbackResult.provider}`);
    return true;
  }

  console.error(`[Scan Alert] WhatsApp fallback failed for tag ${context.tag.slug} via ${fallbackResult.channel}/${fallbackResult.provider}: ${fallbackResult.error}`);
  return false;
}

export async function handleScanAlert(tagId: string, scanLogId: string): Promise<void> {
  try {
    const context = await loadScanAlertContext(tagId, scanLogId);

    if (!context) {
      return;
    }

    if (!canSendByThrottle(context.tag.lastAlertSentAt ?? null)) {
      console.log(`[Scan Alert] Skipped by throttling for tag ${context.tag.slug}`);
      return;
    }

    const tagUrl = buildTagDashboardUrl(context.tag.slug);
    let sentCount = 0;

    if (context.tag.emailAlertsEnabled) {
      try {
        await sendScanAlertEmail({
          email: context.owner.email,
          tagName: context.tag.name,
          scannedAt: context.scanLog.scannedAt,
          city: context.scanLog.city,
          deviceInfo: context.scanLog.deviceInfo,
          tagUrl,
        });
        sentCount += 1;
        console.log(`[Scan Alert] Email sent for tag ${context.tag.slug}`);
      } catch (error) {
        console.error(`[Scan Alert] Email failed for tag ${context.tag.slug}:`, error);
      }
    }

    if (!isFreeProduct(context.tag) && context.tag.whatsappAlertsEnabled) {
      const whatsappSent = await sendWhatsAppWithFallback(context, tagUrl);
      if (whatsappSent) {
        sentCount += 1;
      }
    }

    if (sentCount > 0) {
      await db
        .update(tags)
        .set({ lastAlertSentAt: new Date() })
        .where(eq(tags.id, context.tag.id));
    }
  } catch (error) {
    console.error('[Scan Alert] Unexpected failure:', error);
  }
}
