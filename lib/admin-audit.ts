import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { headers } from "next/headers";

export interface AuditLogParams {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  originalValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action to the audit logs table
 */
export async function logAuditAction(params: AuditLogParams) {
  try {
    await db.insert(auditLogs).values({
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      originalValue: params.originalValue ? JSON.stringify(params.originalValue) : null,
      newValue: params.newValue ? JSON.stringify(params.newValue) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
    // Don't throw - we don't want to break the main action if logging fails
  }
}

/**
 * Get IP address and user agent from request headers
 */
export async function getRequestContext() {
  const headersList = await headers();

  // Get IP address from various possible headers
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";

  const userAgent = headersList.get("user-agent") || "unknown";

  return { ip, userAgent };
}

/**
 * Wrapper function that executes an action and logs it automatically
 * @example
 * const result = await withAuditLog(
 *   "delete_user",
 *   async () => await deleteUser(userId),
 *   { adminId, entityType: "user", entityId: userId }
 * );
 */
export async function withAuditLog<T>(
  action: string,
  fn: () => Promise<T>,
  context: {
    adminId: string;
    entityType: string;
    entityId: string;
    getOriginalValue?: () => any;
    getNewValue?: () => any;
  }
): Promise<T> {
  const { adminId, entityType, entityId, getOriginalValue, getNewValue } = context;

  // Get original value before action
  const originalValue = getOriginalValue ? await getOriginalValue() : undefined;

  try {
    // Execute the action
    const result = await fn();

    // Get new value after action
    const newValue = getNewValue ? await getNewValue() : undefined;

    // Log the successful action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action,
      entityType,
      entityId,
      originalValue,
      newValue,
      ipAddress: ip,
      userAgent,
    });

    return result;
  } catch (error) {
    // Log failed actions as well (with error info in newValue)
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: `${action}_failed`,
      entityType,
      entityId,
      originalValue,
      newValue: { error: error instanceof Error ? error.message : String(error) },
      ipAddress: ip,
      userAgent,
    });

    throw error; // Re-throw the error
  }
}

/**
 * Get recent audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  const { limit = 50, offset = 0, ...whereFilters } = filters || {};

  // TODO: Implement proper filtering with Drizzle ORM
  // For now, just return recent logs
  const logs = await db.query.auditLogs.findMany({
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    limit,
    offset,
  });

  return logs;
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(entityType: string, entityId: string) {
  const logs = await db.query.auditLogs.findMany({
    where: (auditLogs, { eq, and }) =>
      and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)),
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
  });

  return logs;
}

/**
 * Get audit logs for a specific admin
 */
export async function getAdminAuditLogs(adminId: string, limit = 100) {
  const logs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.adminId, adminId),
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    limit,
  });

  return logs;
}

// Common audit action types
export const AuditActions = {
  // User actions
  USER_SUSPENDED: "suspend_user",
  USER_UNSUSPENDED: "unsuspend_user",
  USER_TIER_CHANGED: "change_user_tier",
  USER_DELETED: "delete_user",

  // Order actions
  ORDER_STATUS_CHANGED: "change_order_status",
  ORDER_VERIFIED: "verify_order",
  ORDER_SHIPPED: "ship_order",

  // Tag actions
  TAG_CREATED: "create_tag",
  TAG_STATUS_CHANGED: "change_tag_status",
  TAG_DELETED: "delete_tag",

  // Module actions
  MODULE_GRANTED: "grant_module",
  MODULE_REVOKED: "revoke_module",

  // Production actions
  BATCH_GENERATED: "generate_batch",
  BATCH_PRINTED: "print_batch",
  MATERIAL_USED: "use_material",
  MATERIAL_RESTOCKED: "restock_material",

  // Suspension actions
  SUSPENSION_CREATED: "create_suspension",
  SUSPENSION_LIFTED: "lift_suspension",
} as const;
