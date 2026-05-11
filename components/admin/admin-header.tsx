"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { GlobalSearch } from "./global-search";
import { WITAClock, ProductionDeadlineIndicator } from "./wita-clock";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  division?: string | null;
}

interface AdminSession {
  user: AdminUser;
  session?: {
    token: string;
    expiresAt: Date;
  };
}

interface AdminHeaderProps {
  session: AdminSession | any;
  pendingOrdersCount?: number;
  pendingRequestsCount?: number;
  showMobileMenu?: boolean;
}

export function AdminHeader({ session, pendingOrdersCount = 0, pendingRequestsCount = 0, showMobileMenu = false }: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-20 bg-surface/80 backdrop-blur-md border-b border-secondary/10 flex justify-between items-center px-8 z-40">
      {/* Left Section: Search & Nav */}
      <div className="flex items-center gap-8 flex-1">
        {/* Mobile Menu Toggle */}
        {showMobileMenu && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-sidebar"));
            }}
            className="lg:hidden p-2 rounded-sm hover:bg-neutral transition-colors"
          >
            <span className="material-symbols-outlined text-primary !text-[24px]">
              menu
            </span>
          </button>
        )}

        {/* Global Search */}
        <div className="relative w-full max-w-md hidden md:block">
          <GlobalSearch className="relative w-full" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-8">
          <Link
            href="/admin"
            className="text-primary font-label text-[10px] uppercase tracking-[0.15em] font-bold border-b-2 border-tertiary pb-1 transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/sticker-orders"
            className="text-secondary hover:text-primary font-label text-[10px] uppercase tracking-[0.15em] transition-all flex items-center gap-2"
          >
            Orders
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-tertiary text-surface text-[10px] font-bold rounded-sm">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/analytics"
            className="text-secondary hover:text-primary font-label text-[10px] uppercase tracking-[0.15em] transition-all"
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Right Section: Notifications, WITA Clock, Actions, Profile */}
      <div className="flex items-center gap-6">
        {/* WITA Clock & Deadline Indicator */}
        <div className="hidden lg:flex items-center gap-4">
          <ProductionDeadlineIndicator />
          <div className="h-4 w-[1px] bg-secondary/20"></div>
          <WITAClock />
        </div>

        {/* Notifications */}
        <button className="p-2 text-secondary hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined !text-[20px]" data-icon="notifications">
            notifications
          </span>
          {(pendingOrdersCount > 0 || pendingRequestsCount > 0) && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-tertiary rounded-full ring-2 ring-surface"></span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-4 border-l border-secondary/10 group cursor-pointer" onClick={handleSignOut}>
          <div className="text-right hidden sm:block">
            <p className="font-display text-sm font-bold leading-none text-primary">{session.user.name || 'Admin User'}</p>
            <p className="font-label text-[9px] text-secondary uppercase tracking-widest mt-1">
              {session.user.role || 'Super Admin'}
            </p>
          </div>
          <div className="w-10 h-10 bg-neutral border border-secondary/10 rounded-sm flex items-center justify-center group-hover:border-tertiary/50 transition-all overflow-hidden">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {session.user.name?.[0] || session.user.email[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
