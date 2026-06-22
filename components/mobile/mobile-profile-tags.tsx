'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { QrCode, Shield, Search, Plus, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { updateTagStatus } from '@/app/actions/tag';
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

async function getUserTags(): Promise<TagData[]> {
  try {
    const response = await fetch('/api/mobile/user-tags');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export function MobileProfileTags() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'normal' | 'lost'>('all');
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
      // silently fail, user can retry
    } finally {
      setTogglingId(null);
    }
  }, [togglingId]);

  useEffect(() => {
    if (session?.user?.id) {
      getUserTags().then(data => {
        setTags(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'normal' && tag.status !== 'lost') ||
      (filter === 'lost' && tag.status === 'lost');
    return matchesSearch && matchesFilter;
  });

  const normalCount = tags.filter(t => t.status !== 'lost').length;
  const lostCount = tags.filter(t => t.status === 'lost').length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tag Saya</h1>
            <p className="text-sm text-gray-500 mt-1">
              {tags.length > 0 ? `${tags.length} tag terdaftar` : 'Kelola semua tag Anda'}
            </p>
          </div>
          <Link href="/dashboard/new">
            <div className="w-10 h-10 rounded-xl bg-mobile-primary flex items-center justify-center shadow-lg shadow-mobile-primary/30 btn-press">
              <Plus className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua ({tags.length})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'normal'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Normal ({normalCount})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'lost'
                ? 'bg-mobile-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hilang ({lostCount})
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : !session?.user?.id ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Belum ada tag</p>
            <Link href="/dashboard/new">
              <button className="bg-mobile-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold btn-press">
                Buat Tag Sekarang
              </button>
            </Link>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada tag yang cocok</p>
            <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden ${
                  tag.status === 'lost' ? 'border-l-4 border-l-rose-500' : ''
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Navigasi ke detail tag */}
                  <Link href={`/mobile/tag/${tag.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tag.status === 'lost'
                        ? 'bg-mobile-danger-lighter text-mobile-danger'
                        : 'bg-mobile-primary-lighter text-mobile-primary'
                    }`}>
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate text-sm">{tag.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tag.scanCount} scan • {tag.productType === 'free' ? 'Free' : tag.productType === 'sticker' ? 'Stiker' : 'Premium'}
                      </p>
                      {tag.lastScanned && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(tag.lastScanned).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Toggle mode hilang */}
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

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
