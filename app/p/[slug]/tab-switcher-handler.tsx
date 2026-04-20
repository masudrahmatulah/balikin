'use client';

import { useState } from 'react';
import { AlertTriangle, User, Award } from 'lucide-react';
import { TabSwitcher } from '@/components/tab-switcher';
import { AuthGate } from '@/components/auth-gate';
import { useSession } from '@/lib/auth-client';
import type { Tag, EmergencyInformation } from '@/db/schema';
import type { ScanLog } from '@/db/schema';

interface TabSwitcherHandlerProps {
  tag: Tag;
  emergencyInfo: EmergencyInformation | null;
  recentScans: ScanLog[];
  isLost: boolean;
  isUnclaimed: boolean;
  isFreeTag: boolean;
  isStickerTag: boolean;
  isAcrylicTag: boolean;
  productLabel: string;
  children: React.ReactNode; // The existing public page content
  privateTabContent?: React.ReactNode; // The private tab content (optional initially)
}

export function TabSwitcherHandler({
  tag,
  emergencyInfo,
  recentScans,
  isLost,
  isUnclaimed,
  isFreeTag,
  isStickerTag,
  isAcrylicTag,
  productLabel,
  children,
  privateTabContent,
}: TabSwitcherHandlerProps) {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const { data: session } = useSession();

  const isOwner = session?.user?.id === tag.ownerId;
  const hasTabTwoEnabled = tag.hasTabTwoEnabled || false;

  // If Tab 2 is not enabled, just show the original public page
  if (!hasTabTwoEnabled) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${isLost ? 'bg-red-50' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
      {/* Hero Finder Badge - Pahlawan Penemu */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-4 py-2 text-white">
        <div className="container mx-auto flex max-w-2xl items-center justify-center gap-2 text-center">
          <Award className="h-4 w-4" />
          <span className="font-semibold text-sm">
            Terima kasih sudah menjadi{' '}
            <span className="font-bold">Pahlawan Penemu</span>!
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header with Tab Switcher */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border-2 border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 text-center text-sm font-medium text-green-800">
            <Award className="h-4 w-4 text-green-600" />
            <span className="break-words">
              Anda adalah orang baik yang menghargai milik orang lain!
            </span>
          </div>

          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              isLost ? 'bg-red-100' : 'bg-blue-100'
            } mb-4`}
          >
            {isLost ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>

          <h1
            className={`break-words text-3xl font-bold ${
              isLost ? 'text-red-900' : 'text-gray-900'
            }`}
          >
            {tag.name}
          </h1>
        </div>

        {/* Tab Switcher */}
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwner={!!isOwner}
          hasTabTwoEnabled={hasTabTwoEnabled}
        />

        {/* Tab Content */}
        {activeTab === 'public' ? (
          <div className="space-y-6">{children}</div>
        ) : (
          <AuthGate isAuthenticated={!!isOwner}>
            {privateTabContent || (
              <div className="text-center py-12 text-gray-500">
                <p>Konten privat akan segera hadir.</p>
                <p className="text-sm mt-2">
                  Pilih modul Anda di dashboard untuk memulai.
                </p>
              </div>
            )}
          </AuthGate>
        )}
      </div>
    </div>
  );
}
