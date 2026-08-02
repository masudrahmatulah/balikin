"use server";

import { db } from "@/db";
import { messages, chatRooms, tags, notificationLogs } from "@/db/schema";
import { and, eq, lt, gte, desc, count } from "drizzle-orm";
import { sendScanAlertWhatsApp } from "@/lib/whatsapp";

// ============================================================================
// FASE 5: WhatsApp Debouncer & Agregasi Notifikasi
// ============================================================================

/**
 * Konfigurasi Debouncer (PRD v2 FASE 5)
 * - Delay 2 menit sebelum kirim WA
 * - Cek isReadByOwner sebelum kirim
 * - Maksimal 1x kirim per 5 menit per user
 */
const DEBOUNCE_DELAY_MS = 2 * 60 * 1000; // 2 menit
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 menit
const MAX_WA_PER_USER_PER_WINDOW = 1;

/**
 * Queue item untuk notifikasi tertunda
 */
interface PendingNotification {
  tagId: string;
  ownerId: string;
  messageCount: number;
  firstUnreadAt: Date;
  processedAt?: Date;
}

// In-memory queue (untuk production, gunakan Redis atau database)
const pendingNotifications = new Map<string, PendingNotification>();

/**
 * Cek apakah user melewati rate limit WhatsApp
 */
async function checkWhatsAppRateLimit(ownerId: string): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const recentNotifications = await db.query.notificationLogs.findMany({
    where: and(
      eq(notificationLogs.channel, "whatsapp"),
      gte(notificationLogs.createdAt, fiveMinutesAgo)
    ),
  });

  // Filter notifications yang terkait dengan owner ini
  const ownerTagIds = await db.query.tags.findMany({
    where: eq(tags.ownerId, ownerId),
    columns: { id: true },
  });

  const tagIds = new Set(ownerTagIds.map((t) => t.id));

  const ownerRecentCount = recentNotifications.filter((log) =>
    log.tagId ? tagIds.has(log.tagId) : false
  ).length;

  return ownerRecentCount < MAX_WA_PER_USER_PER_WINDOW;
}

/**
 * Hitung unread messages untuk tag tertentu
 */
async function getUnreadMessageCount(tagId: string): Promise<number> {
  // Cari room aktif untuk tag ini
  const activeRooms = await db.query.chatRooms.findMany({
    where: eq(chatRooms.tagId, tagId),
    columns: { id: true },
  });

  if (activeRooms.length === 0) return 0;

  const roomIds = activeRooms.map((r) => r.id);

  // Hitung unread finder messages
  const unreadMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.senderType, "finder"),
      eq(messages.isReadByOwner, false)
    ),
  });

  return unreadMessages.filter((msg) => roomIds.includes(msg.roomId)).length;
}

/**
 * Agregasi unread messages untuk owner
 */
async function getOwnerUnreadSummary(ownerId: string): Promise<{
  totalUnread: number;
  tagsWithUnread: Array<{ tagId: string; tagName: string; count: number }>;
}> {
  const ownerTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, ownerId),
    columns: { id: true, name: true, contactWhatsapp: true },
  });

  const result = {
    totalUnread: 0,
    tagsWithUnread: [] as Array<{ tagId: string; tagName: string; count: number }>,
  };

  for (const tag of ownerTags) {
    const unreadCount = await getUnreadMessageCount(tag.id);
    if (unreadCount > 0) {
      result.totalUnread += unreadCount;
      result.tagsWithUnread.push({
        tagId: tag.id,
        tagName: tag.name,
        count: unreadCount,
      });
    }
  }

  return result;
}

/**
 * Kirim notifikasi WhatsApp agregasi
 * PRD v2 FASE 5: Grill Guard 3.1
 */
interface UnreadSummary {
  totalUnread: number;
  tagsWithUnread: Array<{ tagId: string; tagName: string; count: number }>;
}

async function sendAggregatedWhatsAppNotification(
  ownerId: string,
  summary: UnreadSummary
): Promise<void> {
  // Ambil info owner
  const ownerTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, ownerId),
    columns: { id: true, name: true, contactWhatsapp: true },
    limit: 1,
  });

  if (ownerTags.length === 0 || !ownerTags[0].contactWhatsapp) {
    console.log(`[Notification] No WhatsApp for owner ${ownerId}`);
    return;
  }

  const phoneNumber = ownerTags[0].contactWhatsapp;
  const totalUnread = summary.tagsWithUnread.reduce((sum, t) => sum + t.count, 0);

  // Generate pesan agregasi
  const messageLines = [
    "🚨 *Balikin Alert!*\n",
    `Ada *${totalUnread}* pesan belum dibaca dari penemu.\n`,
  ];

  if (summary.tagsWithUnread.length === 1) {
    const tag = summary.tagsWithUnread[0];
    messageLines.push(`Tag: ${tag.tagName}`);
    messageLines.push(`Pesan: ${tag.count} pesan baru\n`);
  } else {
    messageLines.push(`Tag terpengaruh: ${summary.tagsWithUnread.length} barang`);
    messageLines.push("");
    for (const tag of summary.tagsWithUnread) {
      messageLines.push(`• ${tag.tagName}: ${tag.count} pesan`);
    }
    messageLines.push("");
  }

  messageLines.push("Balas di dashboard: https://balikin.online/dashboard");
  messageLines.push("");
  messageLines.push("— Balikin Notifications");

  const message = messageLines.join("\n");

  // Kirim WhatsApp
  try {
    const result = await sendScanAlertWhatsApp({
      phoneNumber,
      tagName: summary.tagsWithUnread[0].tagName,
      scannedAt: new Date(),
      city: "Chat Alert",
      deviceInfo: `${totalUnread} unread messages`,
      tagUrl: "https://balikin.online/dashboard",
      channel: "standard",
    });

    // Log notification
    if (summary.tagsWithUnread.length > 0) {
      await db.insert(notificationLogs).values({
        tagId: summary.tagsWithUnread[0].tagId,
        channel: "whatsapp",
        provider: "fonnte_standard",
        status: result.success ? "sent" : "failed",
        errorMessage: result.error,
        providerMessageId: result.providerMessageId,
        sentAt: result.success ? new Date() : null,
      });
    }

    console.log(`[Notification] WhatsApp sent to owner ${ownerId}`);
  } catch (error) {
    console.error(`[Notification] Failed to send WhatsApp:`, error);
  }
}

/**
 * Schedule notification untuk tag dengan unread messages
 * Dipanggil saat ada pesan baru masuk
 */
export async function scheduleChatNotification(tagId: string): Promise<void> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    columns: { id: true, ownerId: true },
  });

  if (!tag || !tag.ownerId) return;

  const key = `tag_${tagId}`;

  // Cek apakah sudah ada pending notification
  const existing = pendingNotifications.get(key);

  if (existing) {
    // Update jumlah pesan
    const unreadCount = await getUnreadMessageCount(tagId);
    existing.messageCount = unreadCount;
    pendingNotifications.set(key, existing);
    console.log(`[Notification] Updated pending notification for tag ${tagId}: ${unreadCount} unread`);
  } else {
    // Buat pending notification baru
    const unreadCount = await getUnreadMessageCount(tagId);
    pendingNotifications.set(key, {
      tagId,
      ownerId: tag.ownerId,
      messageCount: unreadCount,
      firstUnreadAt: new Date(),
    });
    console.log(`[Notification] Scheduled notification for tag ${tagId}: ${unreadCount} unread`);

    // Schedule processing setelah delay
    setTimeout(async () => {
      await processPendingNotification(key);
    }, DEBOUNCE_DELAY_MS);
  }
}

/**
 * Process pending notification setelah delay
 */
async function processPendingNotification(key: string): Promise<void> {
  const pending = pendingNotifications.get(key);

  if (!pending) return;

  // Hapus dari queue
  pendingNotifications.delete(key);

  // Cek rate limit
  const canSend = await checkWhatsAppRateLimit(pending.ownerId);
  if (!canSend) {
    console.log(`[Notification] Rate limit exceeded for owner ${pending.ownerId}`);
    return;
  }

  // Hitung unread saat ini (bisa jadi sudah dibaca owner)
  const currentUnread = await getUnreadMessageCount(pending.tagId);
  if (currentUnread === 0) {
    console.log(`[Notification] All messages read, skipping notification for tag ${pending.tagId}`);
    return;
  }

  // Kirim notifikasi
  const summary = await getOwnerUnreadSummary(pending.ownerId);
  await sendAggregatedWhatsAppNotification(pending.ownerId, summary);

  pending.processedAt = new Date();
  console.log(`[Notification] Processed notification for tag ${pending.tagId}`);
}

/**
 * Manual trigger untuk mengirim notifikasi segera
 * Untuk testing atau force send
 */
export async function sendImmediateChatNotification(tagId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    columns: { id: true, ownerId: true },
  });

  if (!tag || !tag.ownerId) {
    return { success: false, message: "Tag not found or not owned" };
  }

  const summary = await getOwnerUnreadSummary(tag.ownerId);
  if (summary.totalUnread === 0) {
    return { success: false, message: "No unread messages" };
  }

  await sendAggregatedWhatsAppNotification(tag.ownerId, summary);

  return { success: true, message: "Notification sent" };
}

/**
 * Cleanup expired pending notifications
 * Dipanggil secara berkala untuk membersihkan queue
 */
export async function cleanupExpiredNotifications(): Promise<void> {
  const now = Date.now();
  const expiredThreshold = DEBOUNCE_DELAY_MS * 2; // 2x delay time

  for (const [key, pending] of pendingNotifications.entries()) {
    const age = now - pending.firstUnreadAt.getTime();
    if (age > expiredThreshold) {
      pendingNotifications.delete(key);
      console.log(`[Notification] Cleaned up expired notification: ${key}`);
    }
  }
}
