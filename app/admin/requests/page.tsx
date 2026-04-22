import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getPendingModuleRequests } from "@/app/actions/module-request-actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminRequestsTable } from "@/components/admin/admin-requests-table";
import { getAllModules } from "@/lib/admin-modules";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Module Requests - Admin",
  description: "Manage user module requests",
};

export default async function AdminRequestsPage() {
  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/requests");
  }

  // Get all pending requests
  const pendingRequests = await getPendingModuleRequests();

  const allModules = getAllModules();
  const totalPending = pendingRequests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Permintaan Modul
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kelola permintaan akses modul dari user
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Pending Requests</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {totalPending}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Requests Table with Bulk Actions */}
        <AdminRequestsTable pendingRequests={pendingRequests} />
      </main>
    </div>
  );
}
