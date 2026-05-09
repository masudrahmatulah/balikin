import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPendingOrdersCount, getPendingRequestsCount } from "@/lib/admin-stats";
import { AdminErrorBoundary } from "@/components/admin/error-boundary";

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

  // Get user division from session
  const userDivision = session.user.division;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-balikin-gold/30">
      <Sidebar userDivision={userDivision} />
      <div className="lg:ml-sidebar-width">
        <AdminHeader
          session={session}
          pendingOrdersCount={totalPendingOrders}
          pendingRequestsCount={pendingRequestsCount}
          showMobileMenu={true}
        />
        <main className="pt-24 px-8 pb-12">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
