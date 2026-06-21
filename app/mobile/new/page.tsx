import { redirect } from 'next/navigation';
import { createTag } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FREE_TAG_LIMIT } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function MobileNewTagPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, session.user.id),
  });

  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;

  if (isAtLimit) {
    redirect('/mobile?limit=1');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-mobile-primary-light to-mobile-primary rounded-2xl mb-4 shadow-lg shadow-mobile-primary/30">
            <QrCode className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Buat Tag Baru
          </h1>
          <p className="text-sm text-gray-500">
            Buat QR digital untuk melindungi barang berharga Anda
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
          <form action={async (formData) => {
            'use server';
            const name = String(formData.get('name') ?? '').trim();
            const contactWhatsapp = String(formData.get('contactWhatsapp') ?? '').trim();
            const customMessage = String(formData.get('customMessage') ?? '').trim();
            const rewardNote = String(formData.get('rewardNote') ?? '').trim();

            if (!name || !contactWhatsapp) {
              redirect('/mobile/new?error=missing');
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
              redirect('/mobile/new?error=failed');
            }

            redirect(`/mobile/tag/${result.slug}`);
          }} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Barang <span className="text-mobile-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Contoh: Dompet Kulit, HP Android"
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="contactWhatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp <span className="text-mobile-danger">*</span>
              </label>
              <input
                id="contactWhatsapp"
                name="contactWhatsapp"
                type="tel"
                placeholder="628123456789"
                required
                pattern="[0-9]+"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Format internasional tanpa + atau 0 di depan
              </p>
            </div>

            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Pesan Sapaan <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                id="customMessage"
                name="customMessage"
                placeholder="Contoh: Halo, ini dompet milik Budi..."
                rows={3}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label htmlFor="rewardNote" className="block text-sm font-medium text-gray-700 mb-2">
                Imbalan <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                id="rewardNote"
                name="rewardNote"
                type="text"
                placeholder="Contoh: Rp 50.000, Makan siang"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ditampilkan saat status barang hilang
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-mobile-primary-light via-mobile-primary to-mobile-primary-dark text-white py-4 rounded-xl font-semibold shadow-lg shadow-mobile-primary/30 btn-press flex items-center justify-center gap-2"
            >
              <QrCode className="h-5 w-5" />
              Buat Tag
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {freeTagCount} dari {FREE_TAG_LIMIT} tag gratis digunakan
          </p>
        </div>
      </main>
    </div>
  );
}
