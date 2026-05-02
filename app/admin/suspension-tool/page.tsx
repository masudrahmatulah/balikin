import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { suspensionLog, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { SuspensionToolTable } from "@/components/admin/suspension-tool-table";

export const dynamic = "force-dynamic";

export default async function SuspensionToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/suspension-tool");
  }

  // Get all suspensions
  const suspensions = await db.query.suspensionLog.findMany({
    orderBy: [desc(suspensionLog.suspendedAt)],
    with: {
      user: true,
      suspendedByUser: true,
      liftedByUser: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suspension Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user suspensions by User ID or Device ID
        </p>
      </div>

      <SuspensionToolTable suspensions={suspensions} adminId={session.user.id} />
    </div>
  );
}
