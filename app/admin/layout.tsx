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
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white font-body text-gray-900 selection:bg-blue-600/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <div className="pointer-events-none fixed -right-24 top-16 z-0 h-80 w-80 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-700/10" aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 z-0 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl dark:bg-blue-700/10" aria-hidden="true" />
      <Sidebar userDivision={userDivision} />
      <div className="relative z-10 lg:ml-sidebar-width">
        <AdminHeader
          session={session}
          showMobileMenu={true}
          pendingOrdersCount={pendingOrdersCount}
        />
        <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
