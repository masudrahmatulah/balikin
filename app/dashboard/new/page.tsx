import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createTag } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { ArrowLeft, QrCode, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FREE_TAG_LIMIT } from '@/lib/constants';

// This page uses headers() via getSession(), so it must be dynamic
export const dynamic = 'force-dynamic';

export default async function NewTagPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Check if user has reached their free tier limit
  const userTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, session.user.id),
  });

  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;

  // Redirect to dashboard if limit reached
  if (isAtLimit) {
    redirect('/dashboard?limit=1');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="border-b border-blue-100/80 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-center sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="overflow-hidden border-blue-100/80 shadow-xl shadow-blue-900/5 dark:border-slate-700">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-lg bg-brand-red/10 p-2">
                <QrCode className="h-6 w-6 text-brand-red" />
              </div>
              <div>
                <CardTitle>Buat Digital Tag Baru</CardTitle>
                <CardDescription>
                  Buat QR digital untuk wallpaper lockscreen, cetak mandiri, atau profil kontak darurat.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
              <p className="font-semibold text-slate-900 dark:text-white">Sudah memiliki tag akrilik Balikin?</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Aktifkan produk fisik dengan kode SERIAL-PIN—tidak memakai kuota tag digital.</p>
              <Button asChild variant="outline" className="mt-3 border-brand-red/30 text-brand-red hover:bg-brand-red/5"><Link href="/claim"><KeyRound className="mr-2 h-4 w-4" />Aktivasi Tag Akrilik</Link></Button>
            </div>
            <form action={async (formData) => {
              'use server';
              const name = String(formData.get('name') ?? '').trim();
              const contactWhatsapp = String(formData.get('contactWhatsapp') ?? '').trim();
              const customMessage = String(formData.get('customMessage') ?? '').trim();
              const rewardNote = String(formData.get('rewardNote') ?? '').trim();

              if (!name || !contactWhatsapp) {
                redirect('/dashboard/new?error=missing');
              }

              let result: Awaited<ReturnType<typeof createTag>>;
              try {
                result = await createTag({
                  name,
                  contactWhatsapp,
                  customMessage: customMessage || undefined,
                  rewardNote: rewardNote || undefined,
                });
              } catch {
                redirect('/dashboard/new?error=failed');
              }

              redirect(`/dashboard/tag/${result.slug}`);
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Barang *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Dompet Kulit, HP Android, Tas Sekolah"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactWhatsapp">Nomor WhatsApp Kontak *</Label>
                <Input
                  id="contactWhatsapp"
                  name="contactWhatsapp"
                  placeholder="628123456789"
                  required
                  pattern="[0-9]+"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Kontak ini dipakai penemu untuk menghubungi Anda. Gunakan format internasional tanpa + atau 0 di depan.
                </p>
              </div>

              <div>
                <Label htmlFor="customMessage">Pesan Sapaan (opsional)</Label>
                <Textarea
                  id="customMessage"
                  name="customMessage"
                  placeholder="Contoh: Halo, ini dompet milik Budi. Jika Anda menemukannya, mohon hubungi saya."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rewardNote">Imbalan saat Hilang (opsional)</Label>
                <Input
                  id="rewardNote"
                  name="rewardNote"
                  placeholder="Contoh: Rp 50.000, Makan siang, dll"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Field ini opsional dan hanya ditampilkan saat status barang berubah menjadi hilang.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Buat Digital Tag
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
