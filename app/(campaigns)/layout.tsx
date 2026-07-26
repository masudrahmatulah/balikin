export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50">
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
