"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DivisionNavigation, DivisionInfo, type DivisionType } from "@/lib/admin-divisions";
import {
  Settings,
  ScrollText,
  ScanQrCode,
  LayoutDashboard,
  Home,
  Printer,
  BarChart3,
  ClipboardList,
  Wrench,
  Tag,
  CreditCard,
  Users,
  Package,
  Inbox,
  Puzzle,
  LineChart,
  Repeat,
  Target,
  type LucideIcon,
} from "lucide-react";

interface SidebarProps {
  userDivision?: DivisionType | null;
}

// Maps each nav item title to a modern line icon (some divisions reuse the same href for
// different titles, e.g. "/admin" for both "Overview" and "Client Management", so title is the reliable key)
const NAV_ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Overview: Home,
  "Print Queue": Printer,
  "Stock Status": BarChart3,
  "Material Logs": ClipboardList,
  "VDP Tool": Wrench,
  Tags: Tag,
  Payments: CreditCard,
  "Client Management": Users,
  "Sticker Orders": Package,
  Requests: Inbox,
  Modules: Puzzle,
  Analytics: LineChart,
  "Conversion Funnel": Repeat,
  "Module Performance": BarChart3,
  Campaigns: Target,
};

export function Sidebar({ userDivision }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Listen for mobile menu toggle events
  useEffect(() => {
    const handleToggle = () => setIsCollapsed((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  // Get navigation items based on user's division
  const navItems = userDivision
    ? DivisionNavigation[userDivision] || DivisionNavigation.production
    : DivisionNavigation.production;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity",
          !isCollapsed && "opacity-100",
          isCollapsed && "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[248px] bg-primary flex flex-col py-6 px-3 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="mb-8 px-2">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-tertiary to-tertiary/70 rounded-xl flex items-center justify-center text-white shadow-lg shadow-tertiary/20 transition-transform group-hover:scale-105">
              <ScanQrCode className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-white leading-tight">Balikin</h1>
              <p className="text-[11px] text-white/40 tracking-wide uppercase">Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const ItemIcon = NAV_ICONS[item.title] || LayoutDashboard;
            return (
              <Link
                key={`${item.href}-${item.title}`}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-tertiary" />
                )}
                <ItemIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                <span className="text-sm">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-tertiary text-white text-[11px] font-semibold rounded-full">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-white/10 space-y-0.5 px-1">
          {/* Settings Link */}
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/90 rounded-xl transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </Link>

          {/* Audit Logs Link */}
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white/90 rounded-xl transition-colors"
          >
            <ScrollText className="w-[18px] h-[18px]" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
