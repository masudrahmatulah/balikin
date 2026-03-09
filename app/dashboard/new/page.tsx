import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createTag } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { ArrowLeft, QrCode, AlertCircle, Crown } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FREE_TAG_LIMIT } from '@/lib/constants';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Buat Tag Baru</CardTitle>
                <CardDescription>
                  Buat QR code untuk barang Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="name">Nama Tag *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Kunci Motor, Tas Sekolah, Dompet"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactWhatsapp">Nomor WhatsApp *</Label>
                <Input
                  id="contactWhatsapp"
                  name="contactWhatsapp"
                  placeholder="628123456789"
                  required
                  pattern="[0-9]+"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan format internasional tanpa + atau 0 di depan (contoh: 628123456789)
                </p>
              </div>

              <div>
                <Label htmlFor="customMessage">Pesan Personal (opsional)</Label>
                <Textarea
                  id="customMessage"
                  name="customMessage"
                  placeholder="Contoh: Ini adalah kunci motor saya yang sangat penting. Jika Anda menemukannya, mohon hubungi saya."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rewardNote">Imbalan (opsional)</Label>
                <Input
                  id="rewardNote"
                  name="rewardNote"
                  placeholder="Contoh: Rp 50.000, Makan siang, dll"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Imbalan akan ditampilkan saat status barang hilang
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Buat Tag
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
