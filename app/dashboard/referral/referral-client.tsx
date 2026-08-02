'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Copy, Check, Gift, Users } from 'lucide-react';
import { createReferralVoucher, claimEWalletReward } from '@/app/actions/referral';
import type { ReferralVoucher } from '@/db/schema';

const WALLET_OPTIONS = [
  { value: 'GOPAY', label: 'GoPay' },
  { value: 'OVO', label: 'OVO' },
  { value: 'DANA', label: 'DANA' },
  { value: 'SHOPEEPAY', label: 'ShopeePay' },
];

interface Props {
  voucher: ReferralVoucher | null;
  userName: string;
}

export function ReferralClient({ voucher: initialVoucher, userName }: Props) {
  const [voucher, setVoucher] = useState(initialVoucher);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedWallet, setSelectedWallet] = useState('GOPAY');
  const [walletNumber, setWalletNumber] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimError, setClaimError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const usage = voucher?.usageCount ?? 0;
  const target = voucher?.maxUsageTarget ?? 10;
  const progress = Math.min((usage / target) * 100, 100);
  const isExpired = voucher ? voucher.expiresAt < new Date() : false;

  function copyCode() {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function activate() {
    startTransition(async () => {
      const result = await createReferralVoucher();
      if (result.success && result.voucher) setVoucher(result.voucher as ReferralVoucher);
    });
  }

  function submitClaim() {
    if (!voucher || !walletNumber.trim()) return;
    startTransition(async () => {
      setClaimError('');
      const result = await claimEWalletReward(voucher.id, selectedWallet, walletNumber.trim());
      if (result.success) {
        setClaimMessage(result.message ?? 'Klaim berhasil dikirim!');
        setVoucher({ ...voucher, claimStatus: 'PENDING_PROCESSING' });
        setDialogOpen(false);
      } else {
        setClaimError(result.error ?? 'Terjadi kesalahan.');
      }
    });
  }

  function renderClaimButton() {
    if (!voucher) return null;

    if (voucher.claimStatus === 'SUCCESS') {
      return (
        <Badge className="w-full justify-center py-3 text-base bg-green-100 text-green-800 border-green-200">
          <Check className="mr-2 h-4 w-4" /> Terkirim ✓
        </Badge>
      );
    }

    if (voucher.claimStatus === 'PENDING_PROCESSING') {
      return (
        <Button className="w-full" disabled>
          Sedang Dikirim (Maks 24 Jam)
        </Button>
      );
    }

    if (voucher.claimStatus === 'READY_TO_CLAIM') {
      return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700 animate-pulse text-white font-bold py-3 text-base">
              <Gift className="mr-2 h-5 w-5" />
              Ambil Rp50.000 Sekarang!
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Klaim Hadiah Referral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">E-Wallet</label>
                <div className="grid grid-cols-2 gap-2">
                  {WALLET_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setSelectedWallet(w.value)}
                      className={`border rounded-lg py-2 text-sm font-medium transition-colors ${
                        selectedWallet === w.value
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Nomor {WALLET_OPTIONS.find((w) => w.value === selectedWallet)?.label}
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {claimError && <p className="text-red-600 text-sm">{claimError}</p>}
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={submitClaim}
                disabled={isPending || !walletNumber.trim()}
              >
                {isPending ? 'Mengirim...' : 'Kirim Permintaan Klaim'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // NOT_ELIGIBLE
    const remaining = target - usage;
    return (
      <Button className="w-full" disabled>
        Ajak {remaining} Teman Lagi untuk Klaim
      </Button>
    );
  }

  if (!voucher) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Gift className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Belum Punya Kode Referral?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Aktifkan kode personalmu dan mulai ajak teman-teman.
            </p>
          </div>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={activate}
            disabled={isPending}
          >
            {isPending ? 'Membuat Kode...' : 'Aktifkan Kode Referral Saya'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {claimMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
          {claimMessage}
        </div>
      )}

      {/* Kode Referral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kode Referral Kamu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-4 py-3">
            <span className="flex-1 font-mono text-lg font-bold text-gray-900 tracking-widest">
              {voucher.code}
            </span>
            <button onClick={copyCode} className="text-gray-500 hover:text-gray-800 transition-colors">
              {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          {isExpired ? (
            <p className="text-red-500 text-xs mt-2">Voucher kadaluarsa. Hubungi admin untuk perpanjangan.</p>
          ) : (
            <p className="text-gray-400 text-xs mt-2">
              Berlaku hingga {new Date(voucher.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Progress Referral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">{usage} teman bergabung</span>
            <span className="text-orange-600 font-bold">Target: {target}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-gray-400 text-right">{progress.toFixed(0)}% tercapai</p>
        </CardContent>
      </Card>

      {/* Insentif */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-orange-900 text-sm">Hadiah Kamu</p>
              <p className="text-orange-700 text-sm mt-0.5">
                Ajak <strong>{target} teman</strong> beli Balikin pakai kode kamu dan dapatkan{' '}
                <strong>Rp50.000</strong> saldo e-wallet.
              </p>
              <p className="text-orange-600 text-xs mt-1">
                Harga teman kamu: <strong>Rp44.000</strong> (hemat Rp10.000!)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tombol Klaim */}
      <div className="pt-1">{renderClaimButton()}</div>
    </div>
  );
}
