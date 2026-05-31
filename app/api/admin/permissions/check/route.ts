import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionForAction } from "@/lib/admin";
import { hasPermission, type DivisionType } from "@/lib/admin-divisions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const permission = searchParams.get("permission");

    if (!permission) {
      return NextResponse.json(
        { error: "Permission parameter required" },
        { status: 400 }
      );
    }

    const session = await getAdminSessionForAction();
    const userDivision = session?.user?.division as DivisionType | null | undefined;
    const access = hasPermission(userDivision, permission);

    return NextResponse.json({ hasAccess: access });
  } catch (error) {
    console.error("Failed to check permission:", error);
    return NextResponse.json(
      { error: "Failed to check permission", hasAccess: false },
      { status: 500 }
    );
  }
}