import Link from 'next/link';
import { CheckCircle, Tag } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { claimStickerTag, claimTag } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClaimPageProps {
  params: Promise<{ tagId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const session = await getSession();
  const { tagId } = await params;

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tag Tidak Ditemukan</CardTitle>
            <CardDescription>Tag yang ingin Anda klaim tidak tersedia.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  let stickerOrder = null;
  if (tag.productType === 'sticker' && tag.bundleId) {
    const bundle = await db.query.tagBundles.findFirst({
      where: eq(tagBundles.id, tag.bundleId),
    });

    if (bundle) {
      stickerOrder = await db.query.stickerOrders.findFirst({
        where: eq(stickerOrders.id, bundle.orderId),
      });
    }
  }

  if (session?.user?.id) {
    if (tag.productType === 'sticker') {
      if (!stickerOrder) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Sticker Pack Belum Siap</CardTitle>
                <CardDescription>Bundle sticker untuk tag ini belum terhubung dengan order yang valid.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        );
      }

      if (tag.ownerId && tag.ownerId === session.user.id) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Sticker Sudah Aktif</CardTitle>
                <CardDescription>Tag ini sudah terhubung ke akun Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Buka Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      if (stickerOrder.userId !== session.user.id) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Sticker Pack Terkunci</CardTitle>
                <CardDescription>
                  Sticker pack ini sudah dipetakan ke akun pemesan lain dan tidak bisa diklaim oleh akun berbeda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Kembali ke Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <Tag className="h-8 w-8 text-slate-600" />
              </div>
              <CardTitle>Aktivasi Sticker Vinyl</CardTitle>
              <CardDescription>
                Beri nama sticker ini agar langsung muncul rapi di dashboard Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData) => {
                'use server';
                const name = String(formData.get('name') ?? '').trim();
                if (!name) {
                  throw new Error('Nama barang wajib diisi');
                }
                await claimStickerTag(tagId, name);
              }} className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Sticker pack ini terhubung ke order atas nama <span className="font-medium text-slate-900">{stickerOrder.recipientName}</span>.
                </div>
                <div>
                  <Label htmlFor="name">Nama Barang</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={tag.name?.startsWith('Sticker Pack') ? '' : tag.name}
                    placeholder="Contoh: Helm KYT Merah"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Aktifkan Sticker Ini
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    try {
      await claimTag(tagId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengklaim tag';
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Gagal Mengklaim Tag</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Kembali ke Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>{tag.productType === 'sticker' ? 'Aktivasi Sticker Vinyl' : 'Klaim Tag Ini'}</CardTitle>
          <CardDescription>
            Masuk atau daftar untuk menghubungkan tag ini ke akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            <p>Setelah login, tag ini akan terhubung ke akun Anda dan Anda dapat:</p>
            <ul className="mt-2 space-y-1 break-words list-disc list-inside">
              <li>Mengubah status barang hilang/normal</li>
              <li>Melihat riwayat lokasi scan</li>
              <li>Mengedit informasi kontak</li>
            </ul>
          </div>

          <form action="/api/auth/sign-in/email" method="POST" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nama@email.com"
              />
            </div>
            <input type="hidden" name="callbackURL" value={`/claim/${tagId}`} />
            <Button type="submit" className="w-full">
              Kirim Kode OTP
            </Button>
          </form>

          <div className="text-center text-sm leading-6 text-gray-500">
            Atau{' '}
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              kembali ke dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
