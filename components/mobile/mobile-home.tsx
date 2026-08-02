'use client';

import { useState, useCallback } from 'react';
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
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { updateTagStatus } from '@/app/actions/tag';

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

interface MobileHomeProps {
  initialStats: StatsData;
  initialTags: TagData[];
  initialRecentActivity: ScanLog[];
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

export function MobileHome({ initialStats, initialTags, initialRecentActivity }: MobileHomeProps) {
  const { data: session } = useSession();
  const [stats] = useState<StatsData>(initialStats);
  const [tags, setTags] = useState<TagData[]>(initialTags);
  const [recentActivity] = useState<ScanLog[]>(initialRecentActivity);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleLost = useCallback(async (e: React.MouseEvent, tag: TagData) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId) return;
    setTogglingId(tag.id);
    const nextStatus = tag.status === 'lost' ? 'normal' : 'lost';
    try {
      await updateTagStatus(tag.id, nextStatus);
      setTags(prev => prev.map(t => t.id === tag.id ? { ...t, status: nextStatus } : t));
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  }, [togglingId]);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up-20 stagger-delay-1">
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
        <div className="animate-fade-up-20 stagger-delay-2">
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
          <div className="animate-fade-up-20 stagger-delay-3">
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
                  <div
                    key={tag.id}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden ${
                      tag.status === 'lost' ? 'border-l-4 border-l-rose-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <Link href={`/mobile/tag/${tag.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tag.status === 'lost'
                            ? 'bg-mobile-danger-lighter text-mobile-danger'
                            : 'bg-mobile-primary-lighter text-mobile-primary'
                        }`}>
                          <QrCode className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">{tag.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {tag.scanCount} scan • {tag.productType === 'free' ? 'Free' : tag.productType === 'sticker' ? 'Stiker' : 'Premium'}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleToggleLost(e, tag)}
                        disabled={togglingId === tag.id}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 btn-press ${
                          tag.status === 'lost'
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={tag.status === 'lost' ? `Nonaktifkan mode hilang ${tag.name}` : `Aktifkan mode hilang ${tag.name}`}
                      >
                        {togglingId === tag.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : tag.status === 'lost' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>{tag.status === 'lost' ? 'Hilang' : 'Aman'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="animate-fade-up-20 stagger-delay-4">
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
