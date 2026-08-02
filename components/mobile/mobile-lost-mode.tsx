'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface TagData {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  productType: string | null;
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

async function updateTagStatus(tagId: string, status: 'normal' | 'lost') {
  try {
    const response = await fetch('/api/tag/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId, status }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function MobileLostMode() {
  const { data: session } = authClient.useSession();
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const lostTags = tags.filter(tag => tag.status === 'lost');
  const normalTags = tags.filter(tag => tag.status !== 'lost');

  const handleToggleStatus = async (tag: TagData) => {
    const newStatus = tag.status === 'lost' ? 'normal' : 'lost';
    setUpdating(tag.id);

    const success = await updateTagStatus(tag.id, newStatus);

    if (success) {
      setTags(tags.map(t =>
        t.id === tag.id ? { ...t, status: newStatus } : t
      ));
    }

    setUpdating(null);
  };

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Mode Hilang</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola status kehilangan tag</p>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mode Hilang</h1>
          <p className="text-sm text-gray-500 mt-1">Aktifkan status hilang untuk tag Anda</p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Lost Tags Section */}
            {lostTags.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-mobile-danger" />
                  Tag dalam Mode Hilang ({lostTags.length})
                </h2>
                <div className="space-y-3">
                  {lostTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="bg-gradient-to-br from-mobile-danger-light to-mobile-danger rounded-2xl p-4 shadow-lg shadow-mobile-danger/30 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{tag.name}</h3>
                          <p className="text-rose-100 text-sm mt-1">
                            Status: <span className="font-semibold">HILANG</span>
                          </p>
                          <p className="text-rose-100 text-xs mt-0.5">
            Mode hilang aktif - orang yang scan akan melihat info kontak darurat Anda
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleStatus(tag)}
                          disabled={updating === tag.id}
                          className="ml-3 bg-white text-mobile-danger rounded-xl px-4 py-2 font-semibold text-sm disabled:opacity-50 btn-press"
                        >
                          {updating === tag.id ? 'Memproses...' : 'Nonaktifkan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normal Tags Section */}
            {normalTags.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-mobile-success" />
                  Tag Normal ({normalTags.length})
                </h2>
                <div className="space-y-3">
                  {normalTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {tag.productType === 'free' ? 'Free' : tag.productType === 'sticker' ? 'Stiker' : 'Premium'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleStatus(tag)}
                          disabled={updating === tag.id}
                          className="ml-3 bg-mobile-primary text-white rounded-xl px-4 py-2 font-semibold text-sm disabled:opacity-50 btn-press flex items-center gap-2"
                        >
                          {updating === tag.id ? 'Memproses...' : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              Hilangkan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {tags.length === 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada tag</p>
                <p className="text-sm text-gray-400 mt-1">
                  Buat tag untuk menggunakan fitur mode hilang
                </p>
              </div>
            )}
          </>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}
