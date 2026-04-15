import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Sticker } from 'lucide-react';
import { getSession } from '@/lib/session';
import { createStickerOrder } from '@/app/actions/sticker-order';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_LABEL,
  STICKER_QRIS_NOTES,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// This page uses headers() via getSession(), so it must be dynamic
export const dynamic = 'force-dynamic';

export default async function StickerCheckoutPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in?redirect=/stickers/checkout');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/stickers">
            <Button variant="ghost" size="sm" className="w-full justify-center sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Produk Sticker
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sticker className="h-5 w-5 text-emerald-600" />
                Checkout Sticker Vinyl Pack
              </CardTitle>
              <CardDescription>
                Isi data pengiriman Anda. Setelah order dibuat, Anda akan melihat instruksi pembayaran QRIS manual dan status order di dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData) => {
                'use server';
                const order = await createStickerOrder({
                  recipientName: String(formData.get('recipientName') ?? ''),
                  phone: String(formData.get('phone') ?? ''),
                  addressLine: String(formData.get('addressLine') ?? ''),
                  city: String(formData.get('city') ?? ''),
                  postalCode: String(formData.get('postalCode') ?? ''),
                  notes: String(formData.get('notes') ?? ''),
                });

                redirect(`/dashboard/sticker-orders/${order.id}`);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Nama Penerima</Label>
                  <Input id="recipientName" name="recipientName" required placeholder="Contoh: Budi Santoso" />
                </div>

                <div>
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input id="phone" name="phone" required placeholder="628123456789" />
                </div>

                <div>
                  <Label htmlFor="addressLine">Alamat Lengkap</Label>
                  <Textarea id="addressLine" name="addressLine" required rows={4} placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input id="city" name="city" required placeholder="Makassar" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input id="postalCode" name="postalCode" required placeholder="90111" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea id="notes" name="notes" rows={3} placeholder="Contoh: kirim sore hari, warna helm, atau kebutuhan khusus lainnya" />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Lanjutkan ke Instruksi Pembayaran
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-emerald-200 bg-emerald-50/70">
              <CardHeader>
                <CardTitle>Ringkasan Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <span>Produk</span>
                  <span className="font-medium">Sticker Vinyl Pack</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Isi Pack</span>
                  <span className="font-medium">{STICKER_PACK_SIZE} sticker</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Total</span>
                  <span className="text-lg font-semibold text-slate-950">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Pembayaran Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>Metode awal yang dipakai untuk MVP ini adalah <span className="font-medium text-slate-900">{STICKER_PAYMENT_LABEL}</span>.</p>
                <p>{STICKER_QRIS_NOTES}</p>
                <p>Setelah order tersimpan, Anda akan diarahkan ke halaman status order untuk melihat instruksi bayar dan progres verifikasi admin.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
