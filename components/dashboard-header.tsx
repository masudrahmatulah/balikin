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
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/logo-icon.png"
              alt="Balikin Logo"
              className="h-10 w-auto max-w-[140px] sm:max-w-[180px]"
            />
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md">
                    {initials}
                  </div>
                  <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                    {userEmail || 'Pengguna'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900">Akun Saya</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
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
                  <Link href="/pricing" className="flex cursor-pointer items-center gap-2">
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
              {initials}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-3 animate-slideDown">
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-sm font-medium text-slate-900">{userEmail || 'Pengguna'}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Bantuan</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
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
