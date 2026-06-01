'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, Mail, MessageSquare } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  status: string;
  time: string;
  createdAt: Date | string;
}

async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch('/api/mobile/notifications');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export function MobileNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(data => {
      setNotifications(data);
      setIsLoading(false);
    });
  }, []);

  const getNotificationIcon = (type: string) => {
    if (type.includes('whatsapp') || type.includes('wa')) {
      return MessageSquare;
    }
    if (type.includes('email') || type.includes('mail')) {
      return Mail;
    }
    return Bell;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success' || status === 'delivered') {
      return <CheckCircle2 className="h-4 w-4 text-mobile-success" />;
    }
    if (status === 'failed' || status === 'error') {
      return <XCircle className="h-4 w-4 text-mobile-danger" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'success' || status === 'delivered') {
      return 'bg-mobile-success-lighter text-mobile-success';
    }
    if (status === 'failed' || status === 'error') {
      return 'bg-mobile-danger-lighter text-mobile-danger';
    }
    return 'bg-gray-100 text-gray-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'success' || status === 'delivered') return 'Terkirim';
    if (status === 'failed' || status === 'error') return 'Gagal';
    if (status === 'pending') return 'Pending';
    return status;
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
              <p className="text-sm text-gray-500 mt-1">Notifikasi aktivitas tag Anda</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-mobile-primary-lighter text-mobile-primary flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada notifikasi</p>
            <p className="text-sm text-gray-400 mt-1">
              Notifikasi akan muncul di sini ketika ada aktivitas pada tag Anda
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mobile-primary-lighter text-mobile-primary flex items-center justify-center flex-shrink-0">
                      <NotificationIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 flex-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(notification.status)}`}>
                          {getStatusLabel(notification.status)}
                        </span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(notification.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
