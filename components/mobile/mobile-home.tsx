'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
import { useRouter } from 'next/navigation';

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

async function getUserStats(userId: string): Promise<StatsData> {
  try {
    const response = await fetch('/api/mobile/user-stats', {
      cache: 'no-store'
    });
    if (!response.ok) return { totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 };
    return await response.json();
  } catch {
    return { totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 };
  }
}

async function getUserTags(userId: string): Promise<TagData[]> {
  try {
    const response = await fetch('/api/mobile/user-tags', {
      cache: 'no-store'
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function getRecentActivity(userId: string): Promise<ScanLog[]> {
  try {
    const response = await fetch('/api/mobile/recent-activity', {
      cache: 'no-store'
    });
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
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Riwayat Scan',
    description: 'Lacak lokasi terakhir',
    icon: MapPin,
    href: '/mobile/history',
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Notifikasi',
    description: 'Alert aktivitas tag',
    icon: Bell,
    href: '/mobile/notifications',
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Mode Hilang',
    description: 'Aktifkan status darurat',
    icon: Shield,
    href: '/mobile/lost-mode',
    color: 'from-red-500 to-pink-500',
  },
];

export function MobileHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>({ totalTags: 0, totalScans: 0, lostTags: 0, returnRate: 98, returnedItems: 0 });
  const [tags, setTags] = useState<TagData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        getUserStats(session.user.id),
        getUserTags(session.user.id),
        getRecentActivity(session.user.id)
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
    { value: stats.totalTags > 0 ? `${stats.totalTags}+` : '0', label: 'Tag Terdaftar', icon: QrCode, color: 'from-blue-500 to-blue-600' },
    { value: `${stats.returnedItems}`, label: 'Barang Kembali', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { value: `${stats.returnRate}%`, label: 'Tingkat Kembali', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen">
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-5 shadow-xl shadow-red-500/30 border border-white/20 relative overflow-hidden"
          >
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{stats.lostTags} Tag Hilang</p>
                <p className="text-red-100 text-sm">Segera cek dan aktifkan mode hilang</p>
              </div>
              <Link href="/mobile/lost-mode">
                <div className="bg-white text-red-600 rounded-xl px-4 py-2 font-semibold text-sm">
                  Cek
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Main CTA - Laporkan Temuan Barang */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur-2xl opacity-20" />

          <Link href="/mobile/report" className="relative block">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-6 shadow-2xl shadow-blue-500/30 border border-white/20 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <QrCode className="h-8 w-8 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    URGENT
                  </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Laporkan Temuan Barang
                </h2>
                <p className="text-blue-100 mb-6 text-sm">
                  Menemukan barang dengan QR code? Bantu pemiliknya menemukan kembali.
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>24/7 Aktif</span>
                  </div>
                  <div className="bg-white text-blue-600 rounded-xl px-5 py-3 font-semibold shadow-lg flex items-center gap-2">
                    Laporkan Sekarang
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 text-center"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-2 shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-center">{action.title}</h4>
                  <p className="text-xs text-gray-500 text-center">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* My Tags Section */}
        {session?.user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-gray-900">Tag Saya</h3>
              <Link href="/mobile/profile/tags" className="text-sm text-blue-600 font-medium">
                Lihat Semua
              </Link>
            </div>

            {tags.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-white/20 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-3">
                  <Tag className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-3">Belum ada tag</p>
                <Link href="/dashboard/new">
                  <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Buat Tag Sekarang
                  </div>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tags.slice(0, 3).map((tag) => (
                  <Link key={tag.id} href={`/dashboard/tag/${tag.slug}`}>
                    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 ${
                      tag.status === 'lost' ? 'border-l-4 border-l-red-500' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          tag.status === 'lost'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{tag.name}</h4>
                            {tag.status === 'lost' && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">HILANG</span>
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
          </motion.div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-gray-900">Aktivitas Terkini</h3>
              <Link href="/mobile/history" className="text-sm text-blue-600 font-medium">
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
                        ? 'bg-green-100 text-green-600'
                        : activity.status === 'warning'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : activity.status === 'warning' ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <MapPin className="h-6 w-6" />
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
          </motion.div>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
