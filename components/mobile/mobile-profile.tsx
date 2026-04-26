'use client';

import { motion } from 'framer-motion';
import {
  User,
  Settings,
  QrCode,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Tag,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const menuSections = [
  {
    title: 'Akun',
    items: [
      { icon: Tag, label: 'Tag Saya', href: '/mobile/profile/tags', color: 'from-purple-500 to-purple-600', badge: null },
      { icon: Bell, label: 'Notifikasi', href: '/mobile/profile/notifications', color: 'from-orange-500 to-orange-600', badge: null },
    ],
  },
  {
    title: 'Keamanan',
    items: [
      { icon: Shield, label: 'Privasi & Data', href: '/mobile/profile/privacy', color: 'from-green-500 to-green-600', badge: null },
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
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/mobile/user-profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const displayName = session?.user?.name || profileData?.user?.name || 'Pengguna';
  const displayEmail = session?.user?.email || profileData?.user?.email || '';
  const stats = profileData?.stats || { activeTags: 0, totalTags: 0, totalScans: 0, returnedItems: 0 };
  const tagCount = stats.totalTags > 0 ? stats.totalTags : (profileData?.tags?.length || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Profil</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-6 shadow-2xl shadow-blue-500/30 border border-white/20 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              {profileData?.user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{displayName}</h2>
              <p className="text-blue-100 text-sm truncate">{displayEmail}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Shield className="h-3 w-3 text-white" />
                <span className="text-xs text-white font-medium">
                  {profileData?.user?.isVerified ? 'Verified User' : 'Free User'}
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
        </motion.div>

        {/* Lost Tags Alert */}
        {stats.activeTags < tagCount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">{tagCount - stats.activeTags} Tag Hilang</p>
                <p className="text-xs text-red-700">Segera cek dan aktifkan mode hilang</p>
              </div>
              <Link href="/mobile/lost-mode">
                <div className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold">
                  Cek
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{section.title}</h3>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Link key={itemIndex} href={item.href}>
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors active:bg-gray-100">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 flex items-center gap-4 hover:bg-red-50/50 transition-colors group disabled:opacity-50"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {isSigningOut ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 text-white" />
            )}
          </div>
          <span className="font-semibold text-red-600">
            {isSigningOut ? 'Keluar...' : 'Keluar'}
          </span>
        </motion.button>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-sm text-gray-500">Balikin v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Smart Lost & Found Platform Indonesia</p>
        </motion.div>

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
