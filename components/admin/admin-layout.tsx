import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  header?: ReactNode;
}

/**
 * AdminLayout - Layout wrapper untuk semua halaman admin
 * Menjamin konsistensi dengan halaman utama (landing page)
 *
 * Usage:
 *   <AdminLayout
 *     title="Page Title"
 *     description="Page description"
 *     header={<DashboardHeader email={session.user.email} />}
 *   >
 *     {content}
 *   </AdminLayout>
 */
export function AdminLayout({ children, title, description, header }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Header - optional, pass DashboardHeader component */}
      {header}

      {/* Container yang konsisten dengan landing page */}
      <div className="container mx-auto px-4 py-16">
        {(title || description) && (
          <div className="max-w-4xl mx-auto mb-12">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
