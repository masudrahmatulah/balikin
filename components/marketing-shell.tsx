"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { marketingNavLinks } from "@/lib/site-content";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-2 font-semibold" aria-label="Balikin Home">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#07101f] shadow-md shadow-red-600/20">
                <Image
                  src="/balikin_logo.webp"
                  alt="Balikin Logo"
                  width={80}
                  height={80}
                  priority
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                BALIKIN
              </span>
            </a>
            <nav className="hidden gap-5 text-sm text-gray-600 dark:text-slate-300 md:flex" aria-label="Main navigation">
              {marketingNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red rounded px-2 py-1"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <nav
            id="mobile-menu"
            className={`overflow-hidden transition-all duration-200 md:hidden ${isMobileMenuOpen ? "max-h-80 pt-4" : "max-h-0"}`}
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              {marketingNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-slate-50 hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </header>

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
