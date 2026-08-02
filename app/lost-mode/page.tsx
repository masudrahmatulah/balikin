'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

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

export default function LostModePage() {
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mode Hilang</h1>
            <p className="text-gray-600">Kelola status kehilangan tag</p>
          </div>

          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Silakan login terlebih dahulu</p>
              <Button asChild>
                <Link href="/sign-in">Masuk</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mode Hilang</h1>
          <p className="text-gray-600">Aktifkan status hilang untuk tag Anda</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {lostTags.length > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Tag dalam Mode Hilang ({lostTags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lostTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                          <p className="text-sm text-gray-500">
                            Mode hilang aktif - scan akan menampilkan info kontak darurat
                          </p>
                        </div>
                        <Button
                          onClick={() => handleToggleStatus(tag)}
                          disabled={updating === tag.id}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {updating === tag.id ? 'Memproses...' : 'Nonaktifkan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {normalTags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Tag Normal ({normalTags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {normalTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                          <p className="text-sm text-gray-500">
                            {tag.productType === 'free' ? 'Free' : tag.productType === 'sticker' ? 'Stiker' : 'Premium'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleToggleStatus(tag)}
                          disabled={updating === tag.id}
                        >
                          {updating === tag.id ? 'Memproses...' : 'Aktifkan Mode Hilang'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tags.length === 0 && (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada tag</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Buat tag untuk menggunakan fitur mode hilang
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/new">Buat Tag</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
