"use server";

import { db } from "@/db";
import { chatRooms, messages, tags, user } from "@/db/schema";
import { and, eq, gte, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { scheduleChatNotification } from "./notifications";

// ============================================================================
// CONSTANTS (PRD v2 FASE 4)
// ============================================================================

const SENSOR_WORDS = [
  "anjing", "bangsat", "kasar", "bodoh", "stupid", "idiot",
  "scam", "penipu", "fuck", "shit", "asshole", "bitch",
  "kontol", "memek", "perek", "lonte", "jingan",
  "http://", "https://", "www.", ".com", ".id", // Spam link patterns
];

const FINDER_RATE_LIMIT = 5; // Max 5 pesan per menit untuk finder
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 menit

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filter spam dan kata-kata kasar
 */
function filterSpam(text: string): { isSpam: boolean; reason?: string } {
  const lowerText = text.toLowerCase();

  // Cek kata-kata kasar
  for (const word of SENSOR_WORDS) {
    if (lowerText.includes(word)) {
      return { isSpam: true, reason: "Pesan mengandung konten tidak pantas" };
    }
  }

  // Cek pola link mencurigakan
  const linkPattern = /(https?:\/\/)?(www\.)?[a-z0-9\-]+\.(com|id|org|net|xyz|tk|ml)/gi;
  if (linkPattern.test(text)) {
    return { isSpam: true, reason: "Pesan mengandung tautan mencurigakan" };
  }

  return { isSpam: false };
}

/**
 * Cek rate limiting untuk finder
 */
async function checkFinderRateLimit(roomId: string): Promise<{ allowed: boolean; reason?: string }> {
  const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const recentMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.roomId, roomId),
      eq(messages.app_id, 'balikin_id'),
      eq(messages.senderType, "finder"),
      gte(messages.createdAt, oneMinuteAgo)
    ),
    limit: FINDER_RATE_LIMIT + 1,
  });

  if (recentMessages.length >= FINDER_RATE_LIMIT) {
    return {
      allowed: false,
      reason: `Batas pengiriman pesan terlampaui. Maksimal ${FINDER_RATE_LIMIT} pesan per menit.`,
    };
  }

  return { allowed: true };
}

/**
 * Generate fingerprint untuk penemu anonim berdasarkan IP
 */
async function getFinderFingerprint(): Promise<string> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";
  return ip.split(",")[0].trim();
}

async function canAccessChatRoom(room: {
  finderFingerprint: string | null;
  tag?: { ownerId: string | null } | null;
}): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.id && room.tag?.ownerId === session.user.id) {
    return true;
  }

  const finderFingerprint = await getFinderFingerprint();
  return Boolean(room.finderFingerprint && room.finderFingerprint === finderFingerprint);
}

function relationOne<T>(relation: unknown): T | null {
  if (relation === null || relation === undefined) return null;
  if (Array.isArray(relation)) return (relation[0] as T | undefined) ?? null;
  return relation as T;
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Kirim pesan ke chat room
 * PRD v2 FASE 4: Rate limiting + Spam filter
 */
export async function sendMessage(data: {
  roomId: string;
  messageText: string;
  senderType: "owner" | "finder";
}) {
  try {
    const { roomId, messageText, senderType } = data;

    // Validasi input
    if (!messageText || messageText.trim().length === 0) {
      return { success: false, error: "Pesan tidak boleh kosong" };
    }

    if (messageText.length > 1000) {
      return { success: false, error: "Pesan maksimal 1000 karakter" };
    }

    // 1. Cek status room chat
    const room = await db.query.chatRooms.findFirst({
      where: and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')),
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
      },
    });

    if (!room) {
      return { success: false, error: "Ruang obrolan tidak ditemukan" };
    }

    const tag = relationOne<{ id: string; name: string | null; ownerId: string | null }>(room.tag);
    if (!tag) {
      return { success: false, error: "Tag tidak ditemukan" };
    }

    if (!room.isActive) {
      return { success: false, error: "Ruang obrolan sudah ditutup oleh pemilik" };
    }

    if (senderType === "finder" && room.finderFingerprint !== await getFinderFingerprint()) {
      return { success: false, error: "Akses ruang obrolan tidak valid" };
    }

    // 2. Jika sender adalah owner, verifikasi autentikasi
    if (senderType === "owner") {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user || !session.user.id) {
        return { success: false, error: "Anda harus login untuk mengirim pesan sebagai pemilik" };
      }

      // Verifikasi bahwa user adalah pemilik tag
      if (tag.ownerId !== session.user.id) {
        return { success: false, error: "Anda bukan pemilik barang ini" };
      }
    }

    // 3. Spam filter (kedua sender type)
    const spamCheck = filterSpam(messageText);
    if (spamCheck.isSpam) {
      return { success: false, error: spamCheck.reason };
    }

    // 4. Rate limiting khusus untuk finder
    if (senderType === "finder") {
      const rateLimitCheck = await checkFinderRateLimit(roomId);
      if (!rateLimitCheck.allowed) {
        return { success: false, error: rateLimitCheck.reason };
      }
    }

    // 5. Simpan pesan ke database
    const [newMessage] = await db.insert(messages).values({
      app_id: 'balikin_id',
      roomId,
      senderType,
      messageText: messageText.trim(),
    }).returning();

    // Update timestamp room
    await db.update(chatRooms)
      .set({ updatedAt: new Date() })
      .where(and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')));

    // FASE 5: Schedule notification jika finder mengirim pesan
    if (senderType === "finder" && tag.ownerId) {
      // Non-blocking notification
      scheduleChatNotification(tag.id).catch((err) => {
        console.error("[Chat] Failed to schedule notification:", err);
      });
    }

    return {
      success: true,
      message: {
        id: newMessage.id,
        senderType: newMessage.senderType,
        messageText: newMessage.messageText,
        createdAt: newMessage.createdAt,
      },
    };
  } catch (error) {
    console.error("[Chat] Error sending message:", error);
    return { success: false, error: "Terjadi kesalahan saat mengirim pesan" };
  }
}

/**
 * Buat chat room baru untuk tag
 * Dipanggil saat finder pertama kali menghubungi owner
 */
export async function createChatRoom(tagSlug: string): Promise<{ success: boolean; roomId?: string; error?: string }> {
  try {
    // Cari tag berdasarkan slug
    const tag = await db.query.tags.findFirst({
      where: and(eq(tags.slug, tagSlug), eq(tags.app_id, 'balikin_id')),
    });

    if (!tag) {
      return { success: false, error: "Tag tidak ditemukan" };
    }

    if (!tag.ownerId) {
      return { success: false, error: "Tag belum diaktifkan/dimiliki" };
    }

    // Cek apakah sudah ada room aktif untuk tag ini
    const existingRoom = await db.query.chatRooms.findFirst({
      where: and(
        eq(chatRooms.tagId, tag.id),
        eq(chatRooms.isActive, true),
        eq(chatRooms.app_id, 'balikin_id'),
      ),
    });

    if (existingRoom) {
      return { success: true, roomId: existingRoom.id };
    }

    // Buat room baru
    const finderFingerprint = await getFinderFingerprint();

    const [newRoom] = await db.insert(chatRooms).values({
      app_id: 'balikin_id',
      tagId: tag.id,
      finderFingerprint,
      isActive: true,
    }).returning();

    return { success: true, roomId: newRoom.id };
  } catch (error) {
    console.error("[Chat] Error creating chat room:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat ruang obrolan" };
  }
}

/**
 * Blokir/tutup chat room (owner only)
 * PRD v2 FASE 4: Fungsi Pemutus Sesi Sepihak
 */
export async function blockChatRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !session.user.id) {
      return { success: false, error: "Anda harus login" };
    }

    // Verifikasi kepemilikan room
    const room = await db.query.chatRooms.findFirst({
      where: and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')),
      with: {
        tag: {
          columns: {
            ownerId: true,
          },
        },
      },
    });

    if (!room) {
      return { success: false, error: "Ruang obrolan tidak ditemukan" };
    }

    const tag = relationOne<{ ownerId: string | null }>(room.tag);
    if (!tag) {
      return { success: false, error: "Tag tidak ditemukan" };
    }

    if (tag.ownerId !== session.user.id) {
      return { success: false, error: "Anda tidak berhak menutup ruang obrolan ini" };
    }

    // Tutup room
    await db.update(chatRooms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')));

    return { success: true };
  } catch (error) {
    console.error("[Chat] Error blocking chat room:", error);
    return { success: false, error: "Terjadi kesalahan saat menutup ruang obrolan" };
  }
}

/**
 * Ambil pesan-pesan di room
 */
export async function getChatMessages(roomId: string, limit: number = 50) {
  try {
    const room = await db.query.chatRooms.findFirst({
      where: and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')),
      with: {
        tag: {
          columns: { ownerId: true },
        },
      },
    });

    if (!room) {
      return { success: false, error: "Ruang obrolan tidak ditemukan" };
    }

    const tag = relationOne<{ ownerId: string | null }>(room.tag);

    if (!await canAccessChatRoom({ ...room, tag })) {
      return { success: false, error: "Akses ruang obrolan tidak diizinkan" };
    }

    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 50, 1), 100);

    const chatMessages = await db.query.messages.findMany({
      where: and(eq(messages.roomId, roomId), eq(messages.app_id, 'balikin_id')),
      orderBy: [desc(messages.createdAt)],
      limit: safeLimit,
    });

    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id === tag?.ownerId) {
      await db.update(messages)
        .set({ isReadByOwner: true })
        .where(
          and(
            eq(messages.roomId, roomId),
            eq(messages.app_id, 'balikin_id'),
            eq(messages.senderType, "finder")
          )
        );
    }

    return {
      success: true,
        messages: chatMessages.reverse(), // Balik agar kronologis
      roomActive: room.isActive,
    };
  } catch (error) {
    console.error("[Chat] Error getting messages:", error);
    return { success: false, error: "Terjadi kesalahan saat mengambil pesan" };
  }
}

/**
 * Ambil info room untuk ditampilkan di UI
 */
export async function getChatRoom(roomId: string) {
  try {
    const room = await db.query.chatRooms.findFirst({
      where: and(eq(chatRooms.id, roomId), eq(chatRooms.app_id, 'balikin_id')),
      with: {
        tag: {
          columns: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
      },
    });

    if (!room) {
      return { success: false, error: "Ruang obrolan tidak ditemukan" };
    }

    const tag = relationOne<{ id: string; name: string | null; slug: string; ownerId: string | null }>(room.tag);

    if (!await canAccessChatRoom({ ...room, tag })) {
      return { success: false, error: "Akses ruang obrolan tidak diizinkan" };
    }

    return {
      success: true,
      room: {
        id: room.id,
        isActive: room.isActive,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        tag: tag
          ? { id: tag.id, name: tag.name, slug: tag.slug }
          : null,
      },
    };
  } catch (error) {
    console.error("[Chat] Error getting chat room:", error);
    return { success: false, error: "Terjadi kesalahan saat mengambil data ruang obrolan" };
  }
}

/**
 * Hitung unread messages untuk owner
 */
export async function getUnreadCount(ownerId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.id !== ownerId) {
      return { success: false, error: "Akses tidak diizinkan" };
    }

    // Cari semua room aktif dari tag milik owner
    const ownerTags = await db.query.tags.findMany({
      where: and(eq(tags.ownerId, ownerId), eq(tags.app_id, 'balikin_id')),
      columns: { id: true },
    });

    const tagIds = ownerTags.map((t) => t.id);

    if (tagIds.length === 0) {
      return { success: true, count: 0 };
    }

    const activeRooms = await db.query.chatRooms.findMany({
      where: and(
        eq(chatRooms.isActive, true),
        eq(chatRooms.app_id, 'balikin_id'),
        inArray(chatRooms.tagId, tagIds),
      ),
      columns: { id: true },
    });

    if (activeRooms.length === 0) {
      return { success: true, count: 0 };
    }

    const roomIds = activeRooms.map((r) => r.id);

    const unreadMessages = await db.query.messages.findMany({
      where: and(
        eq(messages.senderType, "finder"),
        eq(messages.isReadByOwner, false),
        eq(messages.app_id, 'balikin_id'),
        inArray(messages.roomId, roomIds),
      ),
    });

    return { success: true, count: unreadMessages.length };
  } catch (error) {
    console.error("[Chat] Error getting unread count:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}
