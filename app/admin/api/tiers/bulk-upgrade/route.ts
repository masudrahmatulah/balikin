import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { Division } from "@/lib/admin-divisions";
import { db } from "@/db";
import { user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.division !== Division.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { emails, newRole } = body;

    if (!Array.isArray(emails) || emails.length === 0 || !emails.every((email) => typeof email === "string") || !["user", "premium"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid emails data" }, { status: 400 });
    }

    let successCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const email of emails) {
      try {
        // Find user by email
        const existingUser = await db.query.user.findFirst({
          where: and(eq(user.email, email), eq(user.app_id, APP_ID)),
        });

        if (!existingUser) {
          errors.push({ email, error: "User not found" });
          continue;
        }

        // Update user role
        await db
          .update(user)
          .set({ role: newRole, updatedAt: new Date() })
          .where(and(eq(user.id, existingUser.id), eq(user.app_id, APP_ID)));

        successCount++;
      } catch (error) {
        console.error(`Error updating user ${email}:`, error);
        errors.push({ email, error: "Failed to update" });
      }
    }

    // Log the bulk action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
      action: "bulk_change_user_tier",
      entityType: "user",
      entityId: "bulk",
      originalValue: null,
      newValue: { newRole, successCount, errorCount: errors.length },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      successCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Error bulk upgrading:", error);
    return NextResponse.json({ error: "Failed to bulk upgrade" }, { status: 500 });
  }
}
