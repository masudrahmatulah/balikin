"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";

interface AdminHeaderProps {
  session: Session & { user: { role: string } };
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Balikin Admin
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panel Manajemen Klien & QR Tag
              </p>
            </div>
          </div>

          {/* Admin Badge & Menu */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Admin
            </span>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {session.user.name?.[0] || session.user.email[0].toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm text-slate-600 dark:text-slate-400">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Keluar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
