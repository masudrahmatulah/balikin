import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { stickerOrders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PaymentVerificationGrid } from "@/components/admin/payment-verification-grid";

export const dynamic = "force-dynamic";

export default async class PaymentsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/cs/payments");
  }

  // Get pending payment verifications
  const pendingPayments = await db.query.stickerOrders.findMany({
    where: eq(stickerOrders.paymentStatus, "pending"),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Verification</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and verify customer payment proofs
        </p>
      </div>

      <PaymentVerificationGrid payments={pendingPayments} adminId={session.user.id} />
    </div>
  );
}
