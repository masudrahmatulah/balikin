import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSessionForAction } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { user, tags, studentKitData } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getDeleteDatabaseError(error: unknown) {
  const direct = error && typeof error === 'object' ? error as { code?: unknown; constraint?: unknown; cause?: unknown } : {};
  const cause = direct.cause && typeof direct.cause === 'object'
    ? direct.cause as { code?: unknown; constraint?: unknown }
    : {};
  return {
    code: typeof direct.code === 'string' ? direct.code : typeof cause.code === 'string' ? cause.code : 'UNKNOWN',
    constraint: typeof direct.constraint === 'string'
      ? direct.constraint
      : typeof cause.constraint === 'string' ? cause.constraint : 'unknown',
  };
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSessionForAction();
    if (!adminSession) {
      console.warn("BULK_CLIENT_DELETE_AUTH_DENIED", { reason: "admin_session_unavailable" });
      return NextResponse.json({ error: "Sesi admin tidak ditemukan atau tidak valid. Silakan masuk kembali." }, { status: 401 });
    }

    if (!hasPermission(adminSession.user.division, 'client_management')) {
      console.warn("BULK_CLIENT_DELETE_AUTH_DENIED", {
        reason: "permission_denied",
        role: adminSession.user.role,
        division: adminSession.user.division,
      });
      return NextResponse.json({ error: "Akun admin Anda tidak memiliki izin mengelola klien. Pastikan divisi akun diatur ke Super Admin atau hubungi administrator." }, { status: 403 });
    }

    const body = await req.json();
    const { userIds } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0 || userIds.some((id) => typeof id !== 'string' || id.length === 0)) {
      return NextResponse.json({ error: "Invalid userIds" }, { status: 400 });
    }

    // Prevent deleting yourself
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.includes(adminSession.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const deleted = await db.transaction(async (tx) => {
      const existing = await tx.select({ id: user.id }).from(user).where(and(
        inArray(user.id, uniqueUserIds), eq(user.app_id, "balikin_id")
      ));
      if (existing.length !== uniqueUserIds.length) throw new Error('CLIENT_DELETE_TARGET_MISSING');
      const studentKit = await tx.delete(studentKitData).where(and(
        inArray(studentKitData.userId, uniqueUserIds), eq(studentKitData.app_id, "balikin_id")
      )).returning({ id: studentKitData.id });
      const deletedTags = await tx.delete(tags).where(and(
        inArray(tags.ownerId, uniqueUserIds), eq(tags.app_id, "balikin_id")
      )).returning({ id: tags.id });
      const deletedUsers = await tx.delete(user).where(and(
        inArray(user.id, uniqueUserIds), eq(user.app_id, "balikin_id")
      )).returning({ id: user.id });
      if (deletedUsers.length !== uniqueUserIds.length) throw new Error('CLIENT_DELETE_TARGET_MISSING');
      return { users: deletedUsers.length, tags: deletedTags.length, studentKit: studentKit.length };
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.users} clients`,
      deleted,
    });
  } catch (error) {
    const dbError = getDeleteDatabaseError(error);
    console.error("BULK_CLIENT_DELETE_FAILED", dbError);
    return NextResponse.json(
      { error: dbError.code === '23503' || (dbError.code === '23502' && dbError.constraint === 'suspended_by')
        ? "Klien memiliki data terkait yang belum dapat dihapus. Periksa dependensi klien lalu coba lagi."
        : "Gagal menghapus klien. Perubahan dibatalkan; silakan coba lagi." },
      { status: 500 }
    );
  }
}
