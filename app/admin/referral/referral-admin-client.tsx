'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { confirmRewardTransfer } from '@/app/actions/referral';
import { CheckCircle, Clock } from 'lucide-react';

interface Claim {
  id: string;
  code: string;
  usageCount: number;
  maxUsageTarget: number;
  claimStatus: string;
  walletProvider: string | null;
  walletNumber: string | null;
  claimedAt: Date | null;
  userName: string | null;
  userEmail: string | null;
}

interface Props {
  claims: Claim[];
}

export function ReferralAdminClient({ claims: initialClaims }: Props) {
  const [claims, setClaims] = useState(initialClaims);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm(id: string) {
    setConfirming(id);
    startTransition(async () => {
      const result = await confirmRewardTransfer(id);
      if (result.success) {
        setClaims((prev) => prev.filter((c) => c.id !== id));
      }
      setConfirming(null);
    });
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
        <p className="font-medium text-gray-600">Semua klaim sudah diproses</p>
        <p className="text-sm mt-1">Tidak ada antrean saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <Card key={claim.id} className="border-orange-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900">{claim.userName ?? 'Unknown'}</span>
                  <Badge variant="outline" className="text-xs">{claim.code}</Badge>
                </div>
                <p className="text-sm text-gray-500">{claim.userEmail}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-orange-600">
                    {claim.walletProvider} — {claim.walletNumber}
                  </span>
                  <span className="font-bold text-green-700">Rp50.000</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Diklaim:{' '}
                    {claim.claimedAt
                      ? new Date(claim.claimedAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Referral: {claim.usageCount}/{claim.maxUsageTarget} orang
                </div>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                onClick={() => confirm(claim.id)}
                disabled={isPending && confirming === claim.id}
              >
                {isPending && confirming === claim.id ? 'Memproses...' : 'Konfirmasi Transfer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
