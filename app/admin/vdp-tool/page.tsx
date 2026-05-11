import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { VDPToolForm } from "@/components/admin/vdp-tool-form";
import { ArrowLeft, Tool } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VDPToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/vdp-tool");
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      {/* Header - Heritage Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-secondary/10 pb-8">
        <div>
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label text-[10px] uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight text-balance">Variable Data Printing (VDP) Tool</h1>
          <p className="font-body text-sm text-secondary mt-2">Precision tag generation engine for high-volume manufacturing.</p>
        </div>
        <div className="flex items-center gap-3 bg-neutral px-4 py-2 rounded-sm border border-secondary/5">
           <span className="material-symbols-outlined text-tertiary !text-[18px]">precision_manufacturing</span>
           <span className="font-label text-[10px] uppercase tracking-widest font-bold text-primary">Advanced Production</span>
        </div>
      </div>

      <VDPToolForm adminId={session.user.id} />
    </div>
  );
}
