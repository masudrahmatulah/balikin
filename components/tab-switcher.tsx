'use client';

import { Lock, Search } from 'lucide-react';

interface TabSwitcherProps {
  activeTab: 'public' | 'private';
  onTabChange: (tab: 'public' | 'private') => void;
  isOwner: boolean;
  hasTabTwoEnabled: boolean;
}

export function TabSwitcher({
  activeTab,
  onTabChange,
  isOwner,
  hasTabTwoEnabled,
}: TabSwitcherProps) {
  // Don't show tabs if Tab 2 is not enabled
  if (!hasTabTwoEnabled) {
    return null;
  }

  return (
    <div className="flex gap-2 border-b pb-4 mb-6">
      <button
        onClick={() => onTabChange('public')}
        className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'public'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="Tampilkan tab publik"
      >
        <div className="flex items-center justify-center gap-2">
          <Search className="w-5 h-5" />
          <span className="hidden sm:inline">Publik</span>
          <span className="sm:hidden">Publik</span>
        </div>
      </button>

      <button
        onClick={() => {
          if (isOwner) {
            onTabChange('private');
          }
        }}
        disabled={!isOwner}
        className={`flex-1 py-4 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'private'
            ? 'bg-emerald-600 text-white shadow-lg'
            : !isOwner
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label={
          isOwner
            ? 'Tampilkan tab privat'
            : 'Tab privat hanya untuk pemilik'
        }
      >
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          <span className="hidden sm:inline">Privat</span>
          <span className="sm:hidden">Privat</span>
        </div>
      </button>
    </div>
  );
}
