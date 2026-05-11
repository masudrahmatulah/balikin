"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DivisionNavigation, DivisionInfo, type DivisionType } from "@/lib/admin-divisions";

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

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden transition-opacity",
          !isCollapsed && "opacity-100",
          isCollapsed && "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-sidebar-width bg-surface border-r border-secondary/20 flex flex-col py-8 px-6 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="mb-12 px-2">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center text-surface transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined !text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_2
              </span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-primary uppercase">Balikin</h1>
              <p className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] -mt-1">Heritage Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-all",
                  isActive
                    ? "text-primary bg-neutral font-bold border-l-4 border-tertiary -ml-6 pl-8"
                    : "text-secondary hover:text-primary hover:bg-neutral/50"
                )}
              >
                <span className="material-symbols-outlined !text-[20px]" data-icon={item.title.toLowerCase()}>
                  {typeof item.icon === 'string' ? item.icon : 'dashboard'}
                </span>
                <span className="font-label text-xs uppercase tracking-widest">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-tertiary text-surface rounded-sm">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-8 border-t border-secondary/10 space-y-4">
          {/* Action Button - The Single Accent Rule */}
          <button className="w-full bg-tertiary text-surface py-3 rounded-md font-label text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all active:scale-[0.98] shadow-sm">
            Generate Batch
          </button>

          {/* Settings & Audit Links */}
          <div className="space-y-1">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary transition-all rounded-md group"
            >
              <span className="material-symbols-outlined !text-[18px] group-hover:rotate-45 transition-transform" data-icon="settings">
                settings
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest">Settings</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary transition-all rounded-md group"
            >
              <span className="material-symbols-outlined !text-[18px]" data-icon="receipt_long">
                receipt_long
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest">Audit Logs</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
