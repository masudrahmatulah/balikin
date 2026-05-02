import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { VDPToolForm } from "@/components/admin/vdp-tool-form";

export const dynamic = "force-dynamic";

export default async function VDPToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/vdp-tool");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VDP Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate batch tags untuk produksi stiker dan akrilik
        </p>
      </div>

      <VDPToolForm adminId={session.user.id} />
    </div>
  );
}
