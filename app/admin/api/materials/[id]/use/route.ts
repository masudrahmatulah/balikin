import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { materialInventory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.division, "material_logs")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get current material
    const currentMaterial = await db.query.materialInventory.findFirst({
      where: and(eq(materialInventory.id, id), eq(materialInventory.app_id, APP_ID)),
    });

    if (!currentMaterial) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Check if enough stock
    if (currentMaterial.quantity < amount) {
      return NextResponse.json(
        { error: `Insufficient stock. Current: ${currentMaterial.quantity}, Required: ${amount}` },
        { status: 400 }
      );
    }

    // Update quantity
    const newQuantity = currentMaterial.quantity - amount;

    await db
      .update(materialInventory)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(and(eq(materialInventory.id, id), eq(materialInventory.app_id, APP_ID)));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
      action: "use_material",
      entityType: "material_inventory",
      entityId: id,
      originalValue: { quantity: currentMaterial.quantity },
      newValue: { quantity: newQuantity },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true, newQuantity });
  } catch (error) {
    console.error("Error using material:", error);
    return NextResponse.json({ error: "Failed to use material" }, { status: 500 });
  }
}
