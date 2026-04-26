"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { marketingNavLinks } from "@/lib/site-content";

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <img src="/logo-icon.png" alt="Balikin Logo" className="h-20 w-[260px]" />
            </Link>
            <nav className="hidden gap-5 text-sm text-gray-600 md:flex">
              {marketingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <nav className={`overflow-hidden transition-all duration-200 md:hidden ${isMobileMenuOpen ? "max-h-80 pt-4" : "max-h-0"}`}>
            <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3">
              {marketingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <section className="border-b bg-white/70">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 break-words md:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-gray-600">{description}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-gray max-w-none">{children}</div>
      </section>

      <footer className="border-t bg-gray-50">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-8 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md">&copy; {new Date().getFullYear()} Balikin. Smart Lost &amp; Found QR Tag.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
