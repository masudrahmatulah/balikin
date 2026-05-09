"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { GlobalSearch } from "./global-search";
import { WITAClock, ProductionDeadlineIndicator } from "./wita-clock";

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
    <header className="fixed top-0 right-0 left-[280px] h-16 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant flex justify-between items-center px-8 w-full z-40">
      {/* Left Section: Search & Nav */}
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile Menu Toggle */}
        {showMobileMenu && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-sidebar"));
            }}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant !text-[24px]">
              menu
            </span>
          </button>
        )}

        {/* Global Search */}
        <GlobalSearch className="relative w-full max-w-md" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/admin"
            className="text-balikin-gold border-b-2 border-balikin-gold pb-1 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/sticker-orders"
            className="text-on-surface-variant hover:text-balikin-gold transition-colors font-medium"
          >
            Orders
            {pendingOrdersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-status-critical text-white text-xs font-bold rounded-full">
                {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/analytics"
            className="text-on-surface-variant hover:text-balikin-gold transition-colors font-medium"
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Right Section: Notifications, WITA Clock, Actions, Profile */}
      <div className="flex items-center gap-4">
        {/* WITA Clock & Deadline Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          <ProductionDeadlineIndicator />
          <WITAClock />
        </div>

        {/* Notifications */}
        <button className="p-2 text-on-surface-variant hover:text-balikin-gold transition-colors relative">
          <span className="material-symbols-outlined !text-[20px]" data-icon="notifications">
            notifications
          </span>
          {(pendingOrdersCount > 0 || pendingRequestsCount > 0) && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full border border-surface"></span>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button className="bg-balikin-gold text-on-primary px-4 py-2 rounded font-bold text-label-caps uppercase hover:brightness-110 transition-all active:scale-95">
            Ship Orders
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-4 cursor-pointer group">
          <div className="text-right">
            <p className="text-body-md font-bold leading-none">{session.user.name || 'Admin User'}</p>
            <p className="text-[10px] text-outline font-label-caps uppercase">
              {session.user.role || 'Super Admin'}
            </p>
          </div>
          <div className="w-10 h-10 bg-balikin-gold/20 rounded-full border border-balikin-gold flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-sm font-bold text-balikin-gold">
              {session.user.name?.[0] || session.user.email[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
