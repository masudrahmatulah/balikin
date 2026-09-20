'use client';

import { useState } from 'react';
import { Check, Clipboard, KeyRound, Loader2, Search } from 'lucide-react';
import { getClaimCodesForOrder } from '@/app/actions/sticker-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ClaimCodeLookupProps {
  orderId: string;
  enabled: boolean;
}

export function ClaimCodeLookup({ orderId, enabled }: ClaimCodeLookupProps) {
  const [sheetCode, setSheetCode] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof getClaimCodesForOrder>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function findCodes() {
    setIsLoading(true);
    setCopied(null);
    setResult(await getClaimCodesForOrder(orderId, sheetCode));
    setIsLoading(false);
  }

  async function copyValue(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  const claimText = result?.sheet
    ? `Kode Sheet: ${result.sheet.sheetCode}\nMaster PIN: ${result.sheet.masterPin}\nSerial: ${result.sheet.tags.map((tag) => tag.serialNumber).join(', ')}`
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950 dark:text-white">
          <KeyRound className="h-5 w-5 text-emerald-600" />
          Pusat Kode Klaim
        </CardTitle>
        <CardDescription>
          Masukkan kode sheet yang tercetak di bawah QR untuk melihat Master PIN dan serial tag.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!enabled ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Kode klaim tersedia setelah pembayaran order diverifikasi.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={sheetCode}
                onChange={(event) => setSheetCode(event.target.value.toUpperCase())}
                placeholder="Contoh: BLK-PRO-B01-0001"
                className="font-mono uppercase"
                maxLength={100}
                aria-label="Kode sheet"
              />
              <Button type="button" onClick={findCodes} disabled={isLoading || !sheetCode.trim()} className="sm:min-w-32">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Cari Kode
              </Button>
            </div>

            {result && !result.success && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                {result.error}
              </p>
            )}

            {result?.success && result.sheet && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Kode Sheet</p>
                    <p className="font-mono font-semibold text-slate-950 dark:text-white">{result.sheet.sheetCode}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => copyValue(claimText, 'all')}>
                    {copied === 'all' ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                    Salin Semua
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 dark:bg-slate-900">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Master PIN</p>
                    <p className="font-mono text-xl font-bold tracking-wider text-slate-950 dark:text-white">{result.sheet.masterPin}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => copyValue(result.sheet!.masterPin, 'pin')}>
                    {copied === 'pin' ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                    Salin
                  </Button>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Serial Tag</p>
                  <div className="flex flex-wrap gap-2">
                    {result.sheet.tags.map((tag) => (
                      <span key={tag.slug} className="rounded-md bg-white px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {tag.serialNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
