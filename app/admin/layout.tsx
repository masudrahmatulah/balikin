import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPendingOrdersCount, getPendingRequestsCount } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Get pending counts for header
  const pendingRequestsCount = await getPendingRequestsCount();
  const totalPendingOrders = await getPendingOrdersCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="lg:ml-72">
        <AdminHeader
          session={session}
          pendingOrdersCount={totalPendingOrders}
          pendingRequestsCount={pendingRequestsCount}
          showMobileMenu={true}
        />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
