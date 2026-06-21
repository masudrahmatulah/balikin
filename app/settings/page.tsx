import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/sign-out-button';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userEmail = session.user.email ?? 'Pengguna Balikin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola akun dan preferensi Anda</p>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </div>
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
                <Button variant="ghost" className="w-full justify-start">
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
                <Button variant="ghost" className="w-full justify-start">
                  Kebijakan Privasi
                </Button>
              </Link>
              <Link href="/security">
                <Button variant="ghost" className="w-full justify-start">
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
                <Button variant="ghost" className="w-full justify-start">
                  FAQ
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="w-full justify-start">
                  Hubungi Kami
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
