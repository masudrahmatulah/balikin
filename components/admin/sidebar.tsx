"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DivisionNavigation, DivisionInfo, type DivisionType } from "@/lib/admin-divisions";
import { GlobalSearch } from "./global-search";
import {
  Settings,
  ScrollText,
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
  RotateCcw,
  Boxes,
  Target,
  KeyRound,
  ChevronDown,
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
  "Master PIN Stiker": KeyRound,
  Blog: ScrollText,
  "Strategic Analytics": LineChart,
  Requests: Inbox,
  Modules: Puzzle,
  Analytics: LineChart,
  "Conversion Funnel": Repeat,
  "Module Performance": BarChart3,
  Campaigns: Target,
};

// Sub-menus for the Strategic Analytics page (maps to its tabs via ?tab= query param)
const STRATEGIC_ANALYTICS_SUBMENU: Array<{ label: string; tab: string; icon: LucideIcon }> = [
  { label: "Conversion Funnel", tab: "conversion", icon: Repeat },
  { label: "Recovery & Geo", tab: "recovery-geo", icon: RotateCcw },
  { label: "Batch Activation", tab: "bundles", icon: Boxes },
];

const STRATEGIC_ANALYTICS_TITLE = "Strategic Analytics";

export function Sidebar({ userDivision }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOnAnalytics = pathname.startsWith("/admin/analytics");
  const [analyticsOpen, setAnalyticsOpen] = useState(isOnAnalytics);

  useEffect(() => {
    if (isOnAnalytics) setAnalyticsOpen(true);
  }, [isOnAnalytics]);

  const activeAnalyticsTab = searchParams.get("tab") ?? "conversion";

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
      <button
        type="button"
        aria-label="Tutup menu navigasi"
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity cursor-default",
          !isCollapsed && "opacity-100",
          isCollapsed && "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[248px] bg-gradient-to-b from-blue-700 via-blue-700 to-purple-800 flex flex-col py-6 px-3 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="mb-4 px-2">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-105">
              <Image src="/logo.png" alt="Balikin" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-white leading-tight">Balikin</h1>
              <p className="text-[11px] text-white/50 tracking-wide uppercase">Admin</p>
            </div>
          </Link>
        </div>

        {/* Global Search */}
        <div className="mb-6 px-1">
          <GlobalSearch className="w-full" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const ItemIcon = NAV_ICONS[item.title] || LayoutDashboard;

            // Strategic Analytics renders as an expandable group with sub-menus
            if (item.title === STRATEGIC_ANALYTICS_TITLE) {
              return (
                <div key={`${item.href}-${item.title}`}>
                  <button
                    type="button"
                    onClick={() => setAnalyticsOpen((v) => !v)}
                    aria-expanded={analyticsOpen}
                    className={cn(
                      "group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                      isActive
                        ? "bg-white/15 text-white font-semibold shadow-inner"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                    )}
                    <ItemIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                    <span className="text-sm">{item.title}</span>
                    <ChevronDown
                      className={cn("ml-auto w-4 h-4 transition-transform", analyticsOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {analyticsOpen && (
                    <div className="mt-0.5 space-y-0.5">
                      {STRATEGIC_ANALYTICS_SUBMENU.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = isOnAnalytics && activeAnalyticsTab === sub.tab;
                        return (
                          <Link
                            key={sub.tab}
                            href={`/admin/analytics?tab=${sub.tab}`}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg py-2 pr-3 pl-9 text-sm transition-all",
                              subActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <SubIcon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={`${item.href}-${item.title}`}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                  isActive
                    ? "bg-white/15 text-white font-semibold shadow-inner"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
                <ItemIcon className="w-[18px] h-[18px]" strokeWidth={2} />
                <span className="text-sm">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-white text-blue-700 text-[11px] font-semibold rounded-full">
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
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </Link>

          {/* Audit Logs Link */}
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
          >
            <ScrollText className="w-[18px] h-[18px]" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
