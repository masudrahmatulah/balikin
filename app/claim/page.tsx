import Link from 'next/link';
import { KeyRound, LockKeyhole } from 'lucide-react';
import { claimTagWithUniversalCode } from '@/app/actions/tag';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function UniversalClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10">
            {session?.user?.id ? (
              <KeyRound className="h-8 w-8 text-brand-red" />
            ) : (
              <LockKeyhole className="h-8 w-8 text-brand-red" />
            )}
          </div>
          <CardTitle>Aktivasi Tag Akrilik</CardTitle>
          <CardDescription>
            {session?.user?.id
              ? 'Masukkan kode klaim yang tercantum pada kemasan untuk menghubungkan tag ke akun Anda.'
              : 'Login terlebih dahulu untuk mengaktifkan tag akrilik Anda.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!session?.user?.id ? (
            <Button asChild className="w-full">
              <Link href="/sign-in?redirect=/claim">Login untuk Aktivasi</Link>
            </Button>
          ) : (
            <form
              action={async (formData) => {
                'use server';
                try {
                  await claimTagWithUniversalCode(String(formData.get('claimCode') ?? ''));
                } catch (claimError) {
                  const digest = (claimError as { digest?: string } | null)?.digest ?? '';
                  if (digest.startsWith('NEXT_REDIRECT')) throw claimError;
                  const message = claimError instanceof Error ? claimError.message : 'Kode klaim tidak dapat diproses.';
                  const { redirect } = await import('next/navigation');
                  redirect(`/claim?error=${encodeURIComponent(message)}`);
                }
              }}
              className="space-y-4 text-center"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="claimCode" className="block text-center">Kode Klaim</Label>
                <Input
                  id="claimCode"
                  name="claimCode"
                  required
                  maxLength={100}
                  placeholder="B01-047-001-A3K7-M9P2"
                  className="text-center font-mono uppercase"
                />
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Format: SERIAL-PIN
              </p>
              <Button type="submit" className="w-full">
                Verifikasi & Klaim
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
