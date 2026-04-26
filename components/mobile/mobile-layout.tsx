'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  User,
  QrCode
} from 'lucide-react';
import { useState } from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'report' | 'profile';
}

export function MobileLayout({ children, activeTab = 'home' }: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState(activeTab);

  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home, path: '/mobile' },
    { id: 'report', label: 'Lapor', icon: PlusCircle, path: '/mobile/report' },
    { id: 'profile', label: 'Profil', icon: User, path: '/mobile/profile' },
  ];

  const handleTabChange = (tabId: string, path: string) => {
    setCurrentTab(tabId as any);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Main Content Area */}
      <div className="pb-24 min-h-screen">
        {children}
      </div>

      {/* Bottom Navigation Bar with Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Safe area padding for iOS */}
        <div className="pb-safe">
          <div className="mx-2 mb-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/20">
            <div className="flex items-center justify-around py-3">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id, tab.path)}
                    className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 min-w-[64px]"
                    >
                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-10 blur-lg" />
                    )}

                    {/* Icon with animated background */}
                    <div className={`relative transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400'
                    } rounded-2xl p-3`}>
                      <Icon className={`h-6 w-6 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'scale-100'
                      }`} />
                    </div>

                    {/* Label */}
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {tab.label}
                    </span>

                    {/* Active dot indicator */}
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
