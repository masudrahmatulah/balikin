import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getPendingOrdersCount } from "@/lib/admin-stats";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminErrorBoundary } from "@/components/admin/error-boundary";

export const dynamic = 'force-dynamic';

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

  // Get user division from session
  const userDivision = session.user.division;
  const pendingOrdersCount = await getPendingOrdersCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-gray-900 font-body selection:bg-blue-600/20">
      <Sidebar userDivision={userDivision} />
      <div className="lg:ml-sidebar-width">
        <AdminHeader
          session={session}
          showMobileMenu={true}
          pendingOrdersCount={pendingOrdersCount}
        />
        <main className="pt-24 px-8 pb-12 max-w-[1600px] mx-auto">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
