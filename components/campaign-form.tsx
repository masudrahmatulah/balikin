'use client';

import { useState } from 'react';
import { subscribeCampaignLead } from '@/app/actions/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CampaignFormProps {
  campaignName: string;
  campaignTitle: string;
  onSuccess?: () => void;
}

export function CampaignForm({
  campaignName,
  campaignTitle,
  onSuccess,
}: CampaignFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await subscribeCampaignLead(
        email,
        campaignName,
        'landing_page',
        {
          timestamp: new Date().toISOString(),
          campaign_title: campaignTitle,
        }
      );

      setMessage({
        type: 'success',
        text: result.isNew
          ? '✨ Terima kasih! Silakan cek email Anda untuk konfirmasi.'
          : '✓ Email sudah terdaftar di campaign ini.',
      });
      setEmail('');

      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Terjadi kesalahan, coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Proses...' : 'Daftar'}
          </Button>
        </div>

        {message && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Kami tidak akan spam. Unsubscribe kapan saja.
        </p>
      </div>
    </form>
  );
}
