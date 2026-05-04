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

  // Try to get pending counts, but use defaults if still slow
  let pendingRequestsCount = 0;
  let totalPendingOrders = 0;

  try {
    // These should be faster now with indexes, but use defaults if timeout
    const results = await Promise.allSettled([
      getPendingRequestsCount(),
      getPendingOrdersCount(),
    ]);

    if (results[0].status === 'fulfilled') {
      pendingRequestsCount = results[0].value;
    }
    if (results[1].status === 'fulfilled') {
      totalPendingOrders = results[1].value;
    }
  } catch (error) {
    // Use defaults if queries still fail
    console.log('Pending counts queries still slow, using defaults');
  }

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
