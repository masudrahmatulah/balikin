import type { Metadata } from 'next';
import { CampaignForm } from '@/components/campaign-form';
import { CheckCircle2, Gift, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Balikin Campaign #2 - Dapatkan Diskon Spesial',
  description:
    'Campaign kedua Balikin dengan penawaran eksklusif dan diskon hingga 50% untuk member baru.',
  openGraph: {
    title: 'Balikin Campaign #2',
    description:
      'Penawaran spesial dan diskon eksklusif menanti Anda.',
    type: 'website',
  },
};

export default function CampaignTwoPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Campaign #2 - Limited Time Offer
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                Diskon Spesial{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Hingga 50%
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Penawaran eksklusif untuk Anda yang ingin melindungi barang berharga dengan teknologi terdepan.
                Stok terbatas, jangan sampai kehabisan!
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Teknologi QR Code Terbaru
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Scan dan lacak barang dalam sekejap
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Sistem Notifikasi Real-time
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Terima alert langsung ke WhatsApp Anda
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Support 24/7
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Tim kami siap membantu kapan saja
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg sticky top-20">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Penawaran Terbatas
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Hemat Hingga 50%
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Daftar sekarang dan dapatkan kode diskon eksklusif untuk pembelian pertama Anda.
              </p>

              <CampaignForm
                campaignName="campaign-two"
                campaignTitle="Balikin Campaign #2 - Diskon Spesial"
              />

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  <strong>Terbatas untuk 100 pendaftar pertama</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                10K+
              </div>
              <p className="text-slate-600 dark:text-slate-400">Items Saved</p>
            </div>

            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                99.9%
              </div>
              <p className="text-slate-600 dark:text-slate-400">Uptime Guarantee</p>
            </div>

            <div className="text-center">
              <Gift className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                50%
              </div>
              <p className="text-slate-600 dark:text-slate-400">Early Bird Discount</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>&copy; 2024 Balikin. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
