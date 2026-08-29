"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { WITAClock } from "./wita-clock";
import { Bell, LogOut } from "lucide-react";

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

export function AdminHeader({
  session,
  pendingOrdersCount = 0,
  pendingRequestsCount = 0,
  showMobileMenu = false,
}: AdminHeaderProps) {
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

  const divisionBadge = {
    admin: "Super Admin",
    production: "Production",
    "customer_service": "Customer Service",
    marketing: "Marketing",
  }[session.user.division || "admin"] || "Admin";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-blue-100/80 bg-white/85 px-4 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/85 sm:px-6 lg:left-sidebar-width">
      {/* Left Section: Search & Nav */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        {showMobileMenu && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-sidebar"));
            }}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Buka/tutup menu navigasi"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Right Section: Notifications, Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* WITA Clock */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <WITAClock />
        </div>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300" aria-label="Notifikasi">
          <Bell size={20} aria-hidden="true" />
          {(pendingOrdersCount > 0 || pendingRequestsCount > 0) && (
             <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-600/20 rounded-xl flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0] || session.user.email[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{divisionBadge}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40"
            title="Sign out"
            aria-label="Keluar"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Profile Button */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-600/20 rounded-xl flex items-center justify-center text-white font-semibold">
            {session.user.name?.[0] || session.user.email[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
