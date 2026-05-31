'use client';

import Link from 'next/link';
import {
  QrCode,
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Bell,
  TrendingUp,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

interface TagData {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  productType: string | null;
  scanCount: number;
  lastScanned?: Date | null;
}

interface StatsData {
  totalTags: number;
  totalScans: number;
  lostTags: number;
  returnRate: number;
  returnedItems: number;
}

interface ScanLog {
  id: string;
  tagName: string;
  action: string;
  location: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

async function getUserStats(): Promise<StatsData> {
  try {
    const response = await fetch('/api/mobile/user-stats');
    if (!response.ok) return { totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 };
    return await response.json();
  } catch {
    return { totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 };
  }
}

async function getUserTags(): Promise<TagData[]> {
  try {
    const response = await fetch('/api/mobile/user-tags');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function getRecentActivity(): Promise<ScanLog[]> {
  try {
    const response = await fetch('/api/mobile/recent-activity');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

const quickActions = [
  {
    title: 'Scan QR Code',
    description: 'Scan untuk melihat info pemilik',
    icon: Search,
    href: '/scan',
    color: 'from-cyan-400 to-mobile-primary',
  },
  {
    title: 'Riwayat Scan',
    description: 'Lacak lokasi terakhir',
    icon: MapPin,
    href: '/mobile/history',
    color: 'from-mobile-success-light to-mobile-success',
  },
  {
    title: 'Notifikasi',
    description: 'Alert aktivitas tag',
    icon: Bell,
    href: '/mobile/notifications',
    color: 'from-mobile-warning-light to-mobile-warning',
  },
  {
    title: 'Mode Hilang',
    description: 'Aktifkan status darurat',
    icon: Shield,
    href: '/mobile/lost-mode',
    color: 'from-mobile-danger-light to-mobile-danger',
  },
];

export function MobileHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData>({ totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 });
  const [tags, setTags] = useState<TagData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        getUserStats(),
        getUserTags(),
        getRecentActivity()
      ]).then(([statsData, tagsData, activityData]) => {
        setStats(statsData);
        setTags(tagsData);
        setRecentActivity(activityData);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const statsDisplay = [
    { value: stats.totalTags > 0 ? `${stats.totalTags}+` : '0', label: 'Tag Terdaftar', icon: QrCode, color: 'from-mobile-primary-light to-mobile-primary' },
    { value: `${stats.returnedItems}`, label: 'Barang Kembali', icon: CheckCircle2, color: 'from-mobile-success-light to-mobile-success' },
    { value: `${stats.returnRate}%`, label: 'Tingkat Kembali', icon: TrendingUp, color: 'from-mobile-info-light to-mobile-info' },
  ];

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {session?.user?.name ? `Halo, ${session.user.name.split(' ')[0]} 👋` : 'Selamat datang 👋'}
              </p>
              <h1 className="text-xl font-bold text-gray-900">Balikin</h1>
            </div>
            <Link href="/mobile/profile">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mobile-primary-light to-mobile-primary flex items-center justify-center shadow-lg shadow-mobile-primary/30">
                <span className="text-white font-bold text-lg">
                  {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Lost Items Alert */}
        {stats.lostTags > 0 && (
          <div className="bg-gradient-to-br from-mobile-danger-light to-mobile-danger rounded-3xl p-5 shadow-xl shadow-mobile-danger/30 border border-white/20 relative overflow-hidden animate-fade-up-20">
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{stats.lostTags} Tag Hilang</p>
                <p className="text-rose-100 text-sm">Segera cek dan aktifkan mode hilang</p>
              </div>
              <Link href="/mobile/lost-mode">
                <div className="bg-white text-mobile-danger rounded-xl px-4 py-2 font-semibold text-sm">
                  Cek
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Main CTA - Laporkan Temuan Barang */}
        <div className="relative animate-fade-up-20 stagger-delay-1">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-mobile-primary-light to-mobile-primary rounded-3xl blur-2xl opacity-20" />

          <Link href="/mobile/report" className="relative block">
            <div className="bg-gradient-to-br from-mobile-primary-light via-mobile-primary to-mobile-primary-dark rounded-3xl p-6 shadow-2xl shadow-mobile-primary/30 border border-white/20 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <QrCode className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="bg-mobile-danger text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse-slow">
                    URGENT
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Laporkan Temuan Barang
                </h2>
                <p className="text-blue-100 mb-6 text-sm">
                  Menemukan barang dengan QR code? Bantu pemiliknya menemukan kembali.
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>24/7 Aktif</span>
                  </div>
                  <div className="bg-white text-mobile-primary rounded-xl px-5 py-3 font-semibold shadow-lg flex items-center gap-2">
                    Laporkan Sekarang
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up-20 stagger-delay-2">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 text-center"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-2 shadow-lg`}>
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="animate-fade-up-20 stagger-delay-3">
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 hover:shadow-xl hover:shadow-mobile-primary/10 transition-all duration-300 hover:-translate-y-1 text-center card-touch">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-center">{action.title}</h4>
                  <p className="text-xs text-gray-500 text-center">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Tags Section */}
        {session?.user?.id && (
          <div className="animate-fade-up-20 stagger-delay-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-gray-900">Tag Saya</h3>
              <Link href="/mobile/profile/tags" className="text-sm text-mobile-primary font-medium">
                Lihat Semua
              </Link>
            </div>

            {tags.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-white/20 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-3">
                  <Tag className="h-7 w-7 text-gray-400" aria-hidden="true" />
                </div>
                <p className="text-gray-500 text-sm mb-3">Belum ada tag</p>
                <Link href="/dashboard/new">
                  <div className="inline-block bg-mobile-primary text-white px-4 py-2 rounded-xl text-sm font-semibold btn-press">
                    Buat Tag Sekarang
                  </div>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tags.slice(0, 3).map((tag) => (
                  <Link key={tag.id} href={`/dashboard/tag/${tag.slug}`}>
                    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 ${
                      tag.status === 'lost' ? 'border-l-4 border-l-rose-500' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          tag.status === 'lost'
                            ? 'bg-mobile-danger-lighter text-mobile-danger'
                            : 'bg-mobile-primary-lighter text-mobile-primary'
                        }`}>
                          <QrCode className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{tag.name}</h4>
                            {tag.status === 'lost' && (
                              <span className="text-xs bg-mobile-danger-lighter text-mobile-danger px-2 py-0.5 rounded-full">HILANG</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {tag.scanCount} scan • {tag.productType === 'free' ? 'Free' : tag.productType === 'sticker' ? 'Stiker' : 'Premium'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="animate-fade-up-20 stagger-delay-5">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-gray-900">Aktivitas Terkini</h3>
              <Link href="/mobile/history" className="text-sm text-mobile-primary font-medium">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activity.status === 'success'
                        ? 'bg-mobile-success-lighter text-mobile-success'
                        : activity.status === 'warning'
                        ? 'bg-mobile-danger-lighter text-mobile-danger'
                        : 'bg-mobile-primary-lighter text-mobile-primary'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                      ) : activity.status === 'warning' ? (
                        <Shield className="h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{activity.tagName}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.action} • {activity.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}