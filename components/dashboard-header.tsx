'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/sign-out-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Settings, LogOut, HelpCircle, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardHeaderProps {
  userEmail?: string | null;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user initials for avatar
  const initials = userEmail
    ?.split('@')[0]
    .split('.')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex-shrink-0">
            <img
              src="/logo-icon.png"
              alt="Balikin Logo"
              className="h-10 w-auto max-w-[140px] transition-transform group-hover:scale-[1.03] sm:max-w-[180px]"
            />
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            <nav className="mr-2 hidden items-center gap-1 lg:flex" aria-label="Navigasi dashboard">
              <Link href="/how-it-works" className="rounded-full px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300">Cara Kerja</Link>
              <Link href="/help" className="rounded-full px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300">Bantuan</Link>
            </nav>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20">
                    {initials}
                  </div>
                  <span className="max-w-[150px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {userEmail || 'Pengguna'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Akun Saya</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex cursor-pointer items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Bantuan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-slate-700 transition-colors hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-semibold text-white">
              {initials}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-3 animate-slideDown">
            <div className="rounded-2xl border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 dark:from-blue-950/50 dark:to-purple-950/40">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail || 'Pengguna'}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Bantuan</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <SignOutButton onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
