import { redirect } from "next/navigation";
import { getAdminSession, getAllUsers } from "@/lib/admin";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { ClientsTable } from "@/components/admin/clients-table";
import { CreateTagModal } from "@/components/admin/create-tag-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Get all users with their tag count
  const users = await getAllUsers();

  // Get tag counts for each user
  const usersWithTagCount = await Promise.all(
    users.map(async (user) => {
      const tagCount = await db
        .select({ count: count() })
        .from(tags)
        .where(eq(tags.ownerId, user.id));
      return {
        ...user,
        tagCount: tagCount[0]?.count || 0,
      };
    })
  );

  // Get total stats
  const totalUsers = users.length;
  const totalTagsResult = await db.select({ count: count() }).from(tags);
  const totalTags = totalTagsResult[0]?.count || 0;

  // Get recent tags
  const recentTags = await db.query.tags.findMany({
    orderBy: [desc(tags.createdAt)],
    limit: 10,
    with: {
      scanLogs: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Klien</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Tag Aktif</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalTags}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tag Hilang</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {recentTags.filter(t => t.status === "lost").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Daftar Klien
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Kelola klien dan buat tag QR Code untuk mereka
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/sticker-orders">
                <Button variant="outline">Sticker Orders</Button>
              </Link>
              <CreateTagModal users={usersWithTagCount} />
            </div>
          </div>
          <ClientsTable users={usersWithTagCount} />
        </div>
      </main>
    </div>
  );
}
