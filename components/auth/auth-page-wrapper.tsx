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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
            <h1 className="text-2xl font-bold break-words">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </header>

          {children}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
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