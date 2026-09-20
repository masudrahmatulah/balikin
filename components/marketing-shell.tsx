"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

const currentYear = new Date().getFullYear();

interface MarketingShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function MarketingShell({
  title,
  description,
  children,
}: MarketingShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 break-words dark:text-white md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-gray-600 dark:text-slate-300">{description}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-gray max-w-none dark:prose-invert">{children}</div>
      </section>

      <footer className="border-t border-slate-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-8 text-sm text-gray-600 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md">&copy; {currentYear} Balikin. Smart Lost &amp; Found QR Tag.</p>
          <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
            <a href="/privacy-policy" className="hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red rounded px-2 py-1">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red rounded px-2 py-1">
              Terms
            </a>
            <a href="/contact" className="hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red rounded px-2 py-1">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
