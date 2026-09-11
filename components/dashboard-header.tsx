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
    <header className="sticky top-0 z-50 border-b border-red-100/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-[#07101f]/90">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex flex-shrink-0 items-center gap-2">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#07101f] shadow-md shadow-red-600/20 transition-transform group-hover:scale-[1.03]">
              <img
                src="/balikin_logo.webp"
                alt="Balikin Logo"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden text-xl font-black tracking-tight text-slate-900 sm:inline dark:text-white">
              BALIKIN
            </span>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            <nav className="mr-2 hidden items-center gap-1 lg:flex" aria-label="Navigasi dashboard">
              <Link href="/how-it-works" className="rounded-full px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-brand-red dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-300">Cara Kerja</Link>
              <Link href="/help" className="rounded-full px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-brand-red dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-300">Bantuan</Link>
            </nav>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-red-50 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-navy text-sm font-semibold text-white shadow-md shadow-red-600/20">
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
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-white/70 px-3 py-2 text-slate-700 transition-colors hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-navy text-xs font-semibold text-white">
              {initials}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-3 animate-slideDown">
            <div className="rounded-2xl border border-red-100 bg-white p-2 shadow-xl shadow-red-900/10 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 px-3 py-2 dark:from-brand-red/20 dark:to-brand-navy/40">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail || 'Pengguna'}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-red-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-red-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Bantuan</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-red-50 dark:text-slate-200 dark:hover:bg-slate-800"
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
