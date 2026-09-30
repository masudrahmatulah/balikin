"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconLayoutDashboard,
  IconPrinter,
  IconPackage,
  IconClipboardList,
  IconStack,
  IconTag,
} from "@tabler/icons-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconLayoutDashboard,
  },
  {
    title: "Print Queue",
    href: "/admin/print-queue",
    icon: IconPrinter,
  },
  {
    title: "Stock Status",
    href: "/admin/stock",
    icon: IconPackage,
  },
  {
    title: "Material Logs",
    href: "/admin/material-logs",
    icon: IconClipboardList,
  },
  {
    title: "VDP Tool",
    href: "/admin/vdp-tool",
    icon: IconStack,
  },
  {
    title: "Tags",
    href: "/admin/tags",
    icon: IconTag,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "hover:bg-sky-50",
              "active:scale-[0.98]",
              isActive
                ? "bg-sky-100 text-sky-700"
                : "text-slate-600 hover:text-sky-600"
            )}
          >
            <Icon
              className={cn(
                "transition-colors duration-200",
                isActive
                  ? "[&>*]:stroke-sky-700"
                  : "[&>*]:stroke-slate-600 group-hover:[&>*]:stroke-sky-600"
              )}
              size={20}
              strokeWidth={1.5}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
