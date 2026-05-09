import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { MarketingDashboard } from "@/components/admin/marketing-dashboard";

export const dynamic = "force-dynamic";

export default async function MarketingAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/marketing/analytics");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track conversions, module performance, and user growth metrics
        </p>
      </div>

      <MarketingDashboard />
    </div>
  );
}
