"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";
import { WITAClock } from "./wita-clock";
import { Bell, LogOut, User } from "lucide-react";

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
    <header className="fixed top-0 right-0 left-0 lg:left-sidebar-width h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/70 flex justify-between items-center px-6 z-40">
      {/* Left Section: Search & Nav */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        {showMobileMenu && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-sidebar"));
            }}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Global Search */}
        <div className="hidden md:block flex-1 max-w-md">
          <GlobalSearch className="w-full" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          <Link
            href="/admin/blog"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-gray-600 hover:bg-gray-100 hover:text-primary"
            )}
          >
            Blog
          </Link>
          <Link
            href="/admin/sticker-orders"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-gray-600 hover:bg-gray-100 hover:text-primary"
            )}
          >
            Orders
            {pendingOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-tertiary text-white text-xs font-bold rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/analytics"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-gray-600 hover:bg-gray-100 hover:text-primary"
            )}
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Right Section: Notifications, Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* WITA Clock */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <WITAClock />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors">
          <Bell size={20} />
          {(pendingOrdersCount > 0 || pendingRequestsCount > 0) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tertiary rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-[1px] h-6 bg-gray-200" />

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0] || session.user.email[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500">{divisionBadge}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-tertiary rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Mobile Profile Button */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white font-semibold">
            {session.user.name?.[0] || session.user.email[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
