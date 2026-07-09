'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Validate session has required user data
  const isValidSession = session && session.user && session.user.id;

  // Determine dashboard URL based on user role
  const userRole = (session?.user as any)?.role || 'user';
  const isAdmin = userRole === 'admin';
  const dashboardUrl = isAdmin ? '/admin' : '/dashboard';

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
          onError: () => {
            setIsSigningOut(false);
            setIsMobileMenuOpen(false);
          },
        },
      });
    } catch {
      setIsSigningOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
        {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/logo-icon.png"
                alt="Balikin Logo"
                width={520}
                height={80}
                priority
                className="h-auto w-auto"
                style={{ height: 'auto', maxHeight: '80px' }}
              />
            </motion.div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Navigation Links - Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
          </nav>

          {/* Auth Buttons - Kondisional */}
          <div className="hidden items-center gap-3 md:flex">
            {isPending ? (
              <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
            ) : isValidSession ? (
              <>
                <Link href={dashboardUrl}>
                  <Button className="shadow-lg shadow-blue-600/20">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {isAdmin ? 'Admin' : 'Dashboard'}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isSigningOut ? 'Keluar...' : 'Keluar'}
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button variant="outline">Daftar</Button>
                </Link>
                <Link href="/sign-in">
                  <Button className="shadow-lg shadow-blue-600/20">Masuk</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-200 md:hidden ${isMobileMenuOpen ? 'max-h-56 pt-4' : 'max-h-0'}`}>
          {isPending ? (
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          ) : isValidSession ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
              <Link href={dashboardUrl} onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full shadow-lg shadow-blue-600/20">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full justify-center text-gray-600 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isSigningOut ? 'Keluar...' : 'Keluar'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Daftar</Button>
              </Link>
              <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full shadow-lg shadow-blue-600/20">Masuk</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
