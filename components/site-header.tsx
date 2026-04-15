'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { motion } from 'framer-motion';

export function SiteHeader() {
  // Better Auth 1.6+ useSession no longer accepts options
  const { data: session, isPending, refetch } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Refetch session on mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

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
      // Clear all better-auth cookies explicitly before signing out
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const cookieName = cookie.trim().split('=')[0];
        if (cookieName.includes('better-auth') || cookieName.includes('session')) {
          // Clear cookie for current path and domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          // Also try with . prefix for subdomain cookies
          if (window.location.hostname.includes('.')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        }
      });

      // Use Better Auth's signOut method
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Always redirect regardless of success/error
      // This ensures UI is updated even if signOut API call fails
      setIsMobileMenuOpen(false);
      setIsSigningOut(false);
      // Small delay to ensure cookies are cleared
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
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
              <QrCode className="h-6 w-6 text-blue-600" />
            </motion.div>
            <span className="truncate text-lg font-bold group-hover:text-blue-600 transition-colors sm:text-xl">
              Balikin
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

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
