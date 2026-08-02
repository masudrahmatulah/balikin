import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MapPin, Clock, AlertCircle } from 'lucide-react';
import { db } from '@/db';
import { notificationLogs, tags } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userEmail = session.user.email ?? 'Pengguna Balikin';

  const notifications = await db.query.notificationLogs.findMany({
    where: eq(notificationLogs.userId, session.user.id),
    with: {
      tag: true,
    },
    orderBy: [desc(notificationLogs.createdAt)],
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifikasi
          </h1>
          <p className="text-gray-600">Riwayat notifikasi scan tag Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notifikasi Terkirim</CardTitle>
            <CardDescription>
              Log notifikasi WhatsApp dan email yang dikirim saat tag Anda di-scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada notifikasi terkirim</p>
                <p className="text-sm text-gray-400 mt-1">
                  Notifikasi akan muncul di sini saat tag premium Anda di-scan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.status === 'sent'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {notification.status === 'sent' ? (
                        <Bell className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium text-gray-900">
                            {notification.tag?.name || 'Tag'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.channel === 'priority' ? 'Priority WhatsApp' : notification.channel}
                          </p>
                        </div>
                        <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                          {notification.status === 'sent' ? 'Terkirim' : 'Gagal'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString('id-ID') : '-'}
                        </div>
                      </div>

                      {notification.errorMessage && (
                        <p className="text-sm text-red-600 mt-2">{notification.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
