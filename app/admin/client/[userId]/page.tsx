import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getUserById } from "@/lib/admin";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { ClientTagsList } from "@/components/admin/client-tags-list";
import { ClientQRGenerator } from "@/components/admin/client-qr-generator";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Get client data
  const client = await getUserById(userId);
  if (!client) {
    notFound();
  }

  // Get client's tags
  const clientTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, userId),
    orderBy: [desc(tags.createdAt)],
    with: {
      scanLogs: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Link
          href="/admin"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar Klien
        </Link>

        {/* Client Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {client.name?.[0] || client.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {client.name || "Tanpa Nama"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">{client.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.role === "admin"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {client.role === "admin" ? "Admin" : "User"}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {clientTags.length} Tag Aktif
                  </span>
                </div>
              </div>
            </div>
            <ClientQRGenerator client={client} />
          </div>
        </div>

        {/* Client Tags */}
        <ClientTagsList tags={clientTags} clientId={client.id} />
      </main>
    </div>
  );
}
