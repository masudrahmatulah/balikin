import { redirect } from "next/navigation";
import { isAdmin, getAdminSession } from "@/lib/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { QRStokManager } from "@/components/admin/qr-stok-manager";

export const runtime = "nodejs";

export default async function QRStokPage() {
  // Verify admin access
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/sign-in?redirect=/admin/qr-stok");
  }

  // Get admin session for the header
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
      <AdminHeader session={session as any} />

      <div className="container mx-auto px-4 py-8 print:px-2 print:py-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QR Stok - Gantungan Akrilik Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate QR code untuk stok gantungan akrilik premium. QR yang di-generate belum memiliki owner dan akan otomatis dimiliki oleh orang pertama yang melakukan scan.
          </p>
        </div>

        <QRStokManager />
      </div>
    </div>
  );
}
