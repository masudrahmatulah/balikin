import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { account } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/sign-out-button';
import { SettingsPasswordForm } from '@/components/settings-password-form';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userEmail = session.user.email ?? 'Pengguna Balikin';
  const credentialAccount = await db.query.account.findFirst({
    where: and(
      eq(account.userId, session.user.id),
      eq(account.providerId, 'credential'),
    ),
    columns: { password: true },
  });
  const hasPassword = Boolean(credentialAccount?.password);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-gray-600 dark:text-slate-300">Kelola akun dan preferensi Anda</p>
        </div>

        <div className="space-y-4">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Akun
              </CardTitle>
              <CardDescription>Informasi akun dan profil Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ganti Password
              </CardTitle>
              <CardDescription>
                {hasPassword
                  ? 'Perbarui password akun dan keluarkan sesi aktif di perangkat lain'
                  : 'Akun Google/SSO Anda belum memiliki password. Tetapkan password untuk bisa login dengan email.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsPasswordForm hasPassword={hasPassword} />
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi
              </CardTitle>
              <CardDescription>Pengaturan notifikasi scan dan update</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/notifications">
                  <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  Kelola Notifikasi
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Privacy & Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privasi & Keamanan
              </CardTitle>
              <CardDescription>Pengaturan privasi dan keamanan akun</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/privacy-policy">
                <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  Kebijakan Privasi
                </Button>
              </Link>
              <Link href="/security">
                <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  Informasi Keamanan
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Bantuan
              </CardTitle>
              <CardDescription>Bantuan dan dukungan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/faq">
                <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  FAQ
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  Hubungi Kami
                </Button>
              </Link>
              <Link href="/helpdesk">
                <Button variant="ghost" className="w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                  Helpdesk AI & Konsultasi CS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardContent className="pt-6">
              <SignOutButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
