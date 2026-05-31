import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getAllUsers } from "@/lib/admin";
import { TierManagementTable } from "@/components/admin/tier-management-table";

export const dynamic = "force-dynamic";

export default async function TierManagementPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/tier-management");
  }

  const users = await getAllUsers(100, 0); // Limit to 100 users for now

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tier Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user tiers and upgrade accounts to Premium
        </p>
      </div>

      <TierManagementTable users={users} adminId={session.user.id} />
    </div>
  );
}
