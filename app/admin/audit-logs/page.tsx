import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getAuditLogs } from "@/lib/admin-audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/audit-logs");
  }

  const logs = await getAuditLogs({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Riwayat perubahan yang dilakukan oleh administrator.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
              Belum ada aktivitas tercatat.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {logs.map((log) => (
                <div key={log.id} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {log.entityType} · {log.entityId}
                    </p>
                  </div>
                  <time className="text-sm text-gray-500 dark:text-slate-400 sm:text-right">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("id-ID") : "-"}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
