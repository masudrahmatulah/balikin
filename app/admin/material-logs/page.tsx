import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { materialInventory } from "@/db/schema";
import { MaterialInventoryTable } from "@/components/admin/material-inventory-table";

export const dynamic = "force-dynamic";

export default async function MaterialLogsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/material-logs");
  }

  // Get all materials
  const materials = await db.query.materialInventory.findMany({
    orderBy: (materialInventory, { desc }) => [desc(materialInventory.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Material Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage material inventory (acrylic sheets & vinyl rolls)
          </p>
        </div>
      </div>

      <MaterialInventoryTable materials={materials} adminId={session.user.id} />
    </div>
  );
}
