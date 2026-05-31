import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getUserById } from "@/lib/admin";
import { formatEmailForUser } from "@/lib/admin-privacy";
import { db } from "@/db";
import { tags, stickerOrders, scanLogs } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/admin-header";
import { ClientTagsList } from "@/components/admin/client-tags-list";
import { ClientQRGenerator } from "@/components/admin/client-qr-generator";
import { WhatsAppQuickLink } from "@/components/admin/whatsapp-quick-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Activity, ShoppingBag, Scan, Shield, Phone, Mail } from "lucide-react";

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

  // Get client's orders
  const clientOrders = await db.query.stickerOrders.findMany({
    where: eq(stickerOrders.userId, userId),
    orderBy: [desc(stickerOrders.createdAt)],
  });

  // Get recent activity
  const recentScans = await db.query.scanLogs.findMany({
    where: eq(scanLogs.scannedBy, userId),
    orderBy: [desc(scanLogs.createdAt)],
    limit: 10,
  });

  // Calculate stats
  const totalScans = clientTags.reduce((sum, tag) => sum + (tag.scanLogs?.length || 0), 0);
  const lostTagsCount = clientTags.filter((tag) => tag.status === "lost").length;
  const totalSpent = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <AdminHeader session={session} />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar Klien
        </Link>

        {/* Client Header */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
                {client.name?.[0] || client.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-gray-900 dark:text-white">
                  {client.name || "Tanpa Nama"}
                </h1>
                {/* FIXED: Apply email privacy masking based on user division */}
                <p className="break-all text-gray-600 dark:text-gray-400">
                  {formatEmailForUser(client.email, session.user.division)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.role === "admin"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {client.role === "admin" ? "Admin" : "User"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {clientTags.length} Tag Aktif
                  </span>
                  {lostTagsCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {lostTagsCount} Lost
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ClientQRGenerator client={client} />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open(`/admin/sticker-orders?userId=${userId}`, "_blank")}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders
              </Button>
            </div>
          </div>

          {/* Contact Information with WhatsApp */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                {/* FIXED: Apply email privacy masking based on user division */}
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formatEmailForUser(client.email, session.user.division)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</p>
                <WhatsAppQuickLink
                  phone={client.phone || null}
                  userDivision={session.user.division}
                  recipientName={client.name || "Halo"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User 360 Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{clientTags.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalScans}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rp {totalSpent.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-lg font-bold text-green-600 dark:text-green-400">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Lost Mode Toggle */}
        {lostTagsCount > 0 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              This user has {lostTagsCount} tag(s) marked as lost. Contact them immediately for assistance.
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest scans and interactions from this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <Scan className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Tag scanned: {scan.tagSlug}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(scan.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Tags */}
        <ClientTagsList tags={clientTags} clientId={client.id} />
      </main>
    </div>
  );
}
