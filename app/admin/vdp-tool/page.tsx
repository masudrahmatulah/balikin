import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { BulkGenerationSection } from "@/components/admin/vdp-tool/bulk-generation-section";
import { QuickActionsBar } from "@/components/admin/vdp-tool/quick-actions-bar";

export const dynamic = "force-dynamic";

export default async function VDPToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/vdp-tool");
  }

  return (
    <main className="space-y-8">
      {/* Hero Section: Bulk Generation */}
      <BulkGenerationSection adminId={session.user.id} />

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Recent Activity Section - Temporarily disabled */}
      {/* <RecentTagsSection /> */}
    </main>
  );
}