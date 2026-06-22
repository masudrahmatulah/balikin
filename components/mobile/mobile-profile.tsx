'use client';

import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isVerified: boolean;
}

interface UserStats {
  activeTags: number;
  totalTags: number;
  lostTags: number;
  totalScans: number;
  returnedItems: number;
}

interface UserTag {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  productType: string | null;
  isVerified: boolean;
}

interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  tags: UserTag[];
}

interface RecentActivity {
  id: string;
  item: string;
  tagName: string;
  action: string;
  location: string;
  time: string;
  status: 'success' | 'warning';
}

const menuSections = [
  {
    title: 'Akun',
    items: [
      { icon: Tag, label: 'Tag Saya', href: '/mobile/profile/tags', color: 'from-mobile-info-light to-mobile-info', badge: null },
      { icon: Bell, label: 'Notifikasi', href: '/mobile/profile/notifications', color: 'from-mobile-warning-light to-mobile-warning', badge: null },
    ],
  },
  {
    title: 'Keamanan',
    items: [
      { icon: Shield, label: 'Privasi & Data', href: '/mobile/profile/privacy', color: 'from-mobile-success-light to-mobile-success', badge: null },
      { icon: Settings, label: 'Pengaturan', href: '/mobile/profile/settings', color: 'from-gray-500 to-gray-600', badge: null },
    ],
  },
  {
    title: 'Bantuan',
    items: [
      { icon: HelpCircle, label: 'FAQ & Bantuan', href: '/mobile/profile/help', color: 'from-cyan-500 to-cyan-600', badge: null },
    ],
  },
];

export function MobileProfile() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.replace('/sign-in?redirect=/mobile/profile');
    }
  }, [sessionLoading, session?.user?.id, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setIsDataLoading(true);
    fetch('/api/mobile/user-profile', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setProfileData(data); })
      .catch(() => {})
      .finally(() => setIsDataLoading(false));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/mobile/recent-activity', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setRecentActivity(data); })
      .catch(() => {});
  }, [session?.user?.id]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/sign-in?redirect=/mobile/profile');
    } catch {
      setIsSigningOut(false);
    }
  }, [router]);

  const displayName = session?.user?.name || profileData?.user?.name || 'Pengguna';
  const displayEmail = session?.user?.email || profileData?.user?.email || '';
  const stats = profileData?.stats || { activeTags: 0, totalTags: 0, totalScans: 0, returnedItems: 0 };
  const tagCount = stats.totalTags > 0 ? stats.totalTags : (profileData?.tags?.length || 0);

  const lostTagsCount = stats.lostTags || 0;
  const hasLostTags = lostTagsCount > 0;
  const isVerifiedUser = profileData?.user?.isVerified;

  const avatarInitial = displayName.charAt(0).toUpperCase();

  if (sessionLoading || isDataLoading || (!session?.user?.id && !sessionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite">
        <Loader2 className="h-8 w-8 text-mobile-primary animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Profil</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="bg-gradient-to-br from-mobile-primary-light via-mobile-primary to-mobile-primary-dark rounded-3xl p-6 shadow-2xl shadow-mobile-primary/30 border border-white/20 relative overflow-hidden animate-fade-up-20">
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{avatarInitial}</span>
              </div>
              {isVerifiedUser && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-mobile-success rounded-full flex items-center justify-center border-2 border-white" aria-label="Verified user">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{displayName}</h2>
              <p className="text-blue-100 text-sm truncate">{displayEmail}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Shield className="h-3 w-3 text-white" aria-hidden="true" />
                <span className="text-xs text-white font-medium">
                  {isVerifiedUser ? 'Verified User' : 'Free User'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 pt-6 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{tagCount}</p>
                <p className="text-xs text-blue-100">Tag Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalScans}</p>
                <p className="text-xs text-blue-100">Total Scan</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.returnedItems}</p>
                <p className="text-xs text-blue-100">Kembali</p>
              </div>
            </div>
          </div>
        </div>

        {recentActivity.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20 stagger-delay-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.status === 'warning'
                      ? 'bg-mobile-danger-light'
                      : 'bg-mobile-success-light'
                  }`}>
                    {activity.status === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-mobile-danger" />
                    ) : (
                      <div className="w-2 h-2 bg-mobile-success rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{activity.tagName}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.action} • {activity.location}</p>
                  </div>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              ))}
            </div>
            <Link
              href="/mobile/profile/activity"
              className="text-sm text-mobile-primary font-semibold mt-3 block px-1"
            >
              Lihat Semua →
            </Link>
          </div>
        )}

        {hasLostTags && (
          <div className="bg-mobile-danger-lighter border border-mobile-danger-lighter rounded-2xl p-4 animate-fade-up-20 stagger-delay-1" role="alert" aria-live="assertive">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-mobile-danger flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-mobile-danger">{lostTagsCount} Tag Hilang</p>
                <p className="text-xs text-mobile-danger">Segera cek dan aktifkan mode hilang</p>
              </div>
              <Link href="/mobile/lost-mode">
                <div className="bg-mobile-danger text-white px-3 py-2 rounded-xl text-sm font-semibold btn-press">
                  Cek
                </div>
              </Link>
            </div>
          </div>
        )}

        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="animate-fade-up-20" style={{ animationDelay: `${sectionIndex * 0.05}s` }}>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{section.title}</h3>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Link key={item.href} href={item.href} className="block">
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors active:bg-gray-100 btn-press">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`} aria-hidden="true">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-mobile-primary-lighter text-mobile-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 flex items-center gap-4 hover:bg-mobile-danger-lighter/50 transition-colors group disabled:opacity-50 btn-press animate-fade-up-20"
          aria-label={isSigningOut ? 'Keluar dari akun...' : 'Keluar dari akun'}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mobile-danger-light to-mobile-danger flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" aria-hidden="true">
            {isSigningOut ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 text-white" />
            )}
          </div>
          <span className="font-semibold text-mobile-danger">
            {isSigningOut ? 'Keluar...' : 'Keluar'}
          </span>
        </button>

        <div className="text-center py-6 animate-fade-up-20">
          <p className="text-sm text-gray-500">Balikin v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Smart Lost & Found Platform Indonesia</p>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}
