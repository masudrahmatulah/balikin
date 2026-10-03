export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">{children}</div>;
}
