import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { printQueue } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PrintQueueTable } from "@/components/admin/print-queue-table";

export const dynamic = "force-dynamic";

export default async function PrintQueuePage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/print-queue");
  }

  // Get all print queue items
  const queueItems = await db.query.printQueue.findMany({
    orderBy: [desc(printQueue.createdAt)],
    with: {
      printedByUser: true,
      materialInventory: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Print Queue</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage batch printing jobs and track production status
        </p>
      </div>

      <PrintQueueTable items={queueItems} adminId={session.user.id} />
    </div>
  );
}
