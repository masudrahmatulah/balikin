'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Tag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const menuSections = [
  {
    title: 'Akun',
    items: [
      { icon: Tag, label: 'Tag Saya', href: '/mobile/profile/tags', color: 'from-mobile-info-light to-mobile-info' },
      { icon: Bell, label: 'Notifikasi', href: '/mobile/profile/notifications', color: 'from-mobile-warning-light to-mobile-warning' },
    ],
  },
  {
    title: 'Keamanan',
    items: [
      { icon: Shield, label: 'Privasi & Data', href: '/mobile/profile/privacy', color: 'from-mobile-success-light to-mobile-success' },
      { icon: Shield, label: 'Pengaturan Akun', href: '#', color: 'from-gray-500 to-gray-600', action: 'account' },
    ],
  },
  {
    title: 'Bantuan',
    items: [
      { icon: HelpCircle, label: 'FAQ & Bantuan', href: '/mobile/profile/help', color: 'from-cyan-500 to-cyan-600' },
    ],
  },
];

export default function MobileProfileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = session?.user?.name || 'Pengguna';
  const displayEmail = session?.user?.email || '';

  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/sign-in');
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-mobile-primary-light via-mobile-primary to-mobile-primary-dark rounded-3xl p-6 shadow-2xl shadow-mobile-primary/30 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{avatarInitial}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{displayName}</h2>
              <p className="text-blue-100 text-sm">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{section.title}</h3>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Link key={item.href} href={item.href} className="block">
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors active:bg-gray-100 btn-press">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20 flex items-center gap-4 hover:bg-mobile-danger-lighter/50 transition-colors group disabled:opacity-50 btn-press"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mobile-danger-light to-mobile-danger flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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

        {/* Version Info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">Balikin v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Smart Lost & Found Platform Indonesia</p>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}
