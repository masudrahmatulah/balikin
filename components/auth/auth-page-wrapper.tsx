import { ReactNode } from "react";

interface AuthPageWrapperProps {
  children: ReactNode;
  title: string;
  description: string;
  icon: ReactNode;
}

export function AuthPageWrapper({ children, title, description, icon }: AuthPageWrapperProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/30 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-xl shadow-red-900/10 dark:border-red-900/50 dark:bg-slate-900 sm:p-8">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10 ring-8 ring-brand-red/5">
              {icon}
            </div>
            <h1 className="text-2xl font-bold break-words">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </header>

          {children}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-slate-600 transition-colors hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 rounded dark:text-slate-400 dark:hover:text-red-300"
            >
              &larr; Kembali ke Beranda
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          &copy; {currentYear} Balikin. Smart Lost & Found QR Tag.
        </p>
      </div>
    </div>
  );
}
