import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { materialInventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, adminId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get current material
    const currentMaterial = await db.query.materialInventory.findFirst({
      where: eq(materialInventory.id, params.id),
    });

    if (!currentMaterial) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Update quantity
    const newQuantity = currentMaterial.quantity + amount;

    await db
      .update(materialInventory)
      .set({
        quantity: newQuantity,
        lastRestockedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(materialInventory.id, params.id));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "restock_material",
      entityType: "material_inventory",
      entityId: params.id,
      originalValue: { quantity: currentMaterial.quantity },
      newValue: { quantity: newQuantity },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true, newQuantity });
  } catch (error) {
    console.error("Error restocking material:", error);
    return NextResponse.json({ error: "Failed to restock" }, { status: 500 });
  }
}
