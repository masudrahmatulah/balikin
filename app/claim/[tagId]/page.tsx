import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { claimTag } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ClaimPageProps {
  params: Promise<{ tagId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const session = await getSession();

  const { tagId } = await params;

  // If user is logged in, attempt to claim
  if (session?.user?.id) {
    try {
      await claimTag(tagId);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Tag Berhasil Diklaim!</CardTitle>
              <CardDescription>
                Tag ini sekarang terhubung ke akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Buka Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    } catch (error: any) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Gagal Mengklaim Tag</CardTitle>
              <CardDescription>
                {error.message || 'Terjadi kesalahan saat mengklaim tag'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  Kembali ke Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Show sign-in prompt
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Tag className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Klaim Tag Ini</CardTitle>
          <CardDescription>
            Masuk atau daftar untuk mengklaim tag ini ke akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p>
              Setelah login, tag ini akan terhubung ke akun Anda dan Anda dapat:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Mengubah status barang hilang/normal</li>
              <li>Melihat riwayat lokasi scan</li>
              <li>Mengedit informasi kontak</li>
            </ul>
          </div>

          {/* Better Auth Sign In Form */}
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
            <input
              type="hidden"
              name="callbackURL"
              value={`/claim/${tagId}`}
            />
            <Button type="submit" className="w-full">
              Kirim Kode OTP
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
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
