"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DivisionNavigation, DivisionInfo, type DivisionType } from "@/lib/admin-divisions";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  userDivision?: DivisionType | null;
}

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

  // Get division info for styling
  const divisionInfo = userDivision ? DivisionInfo[userDivision] : DivisionInfo.production;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          !isCollapsed && "opacity-100",
          isCollapsed && "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container dark:bg-surface-container border-r border-outline-variant dark:border-outline-variant flex flex-col h-full py-6 px-4 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-balikin-gold rounded flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined !text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              qr_code_2
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-balikin-gold">Balikin Admin</h1>
            <p className="font-label-caps text-[10px] text-outline uppercase tracking-widest">Management Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-transform active:scale-95",
                  isActive
                    ? "text-balikin-gold font-bold bg-surface-variant/50"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-200"
                )}
              >
                <span className="material-symbols-outlined !text-[20px]" data-icon={item.title.toLowerCase()}>
                  {typeof item.icon === 'string' ? item.icon : 'dashboard'}
                </span>
                <span className="font-label-caps text-label-caps uppercase">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-status-critical text-white rounded-full">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-2">
          {/* Generate Batch Button */}
          <button className="w-full bg-balikin-gold text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="add_circle">
              add_circle
            </span>
            Generate Batch
          </button>

          {/* Settings & Audit Links */}
          <div className="pt-4 space-y-1">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all rounded-lg"
            >
              <span className="material-symbols-outlined !text-[20px]" data-icon="settings">
                settings
              </span>
              <span className="font-label-caps text-label-caps uppercase">Settings</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all rounded-lg"
            >
              <span className="material-symbols-outlined !text-[20px]" data-icon="receipt_long">
                receipt_long
              </span>
              <span className="font-label-caps text-label-caps uppercase">Audit Logs</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
