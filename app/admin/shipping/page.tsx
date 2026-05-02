import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { stickerOrders, shippingTracking } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ShippingTable } from "@/components/admin/shipping-table";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/shipping");
  }

  // Get paid orders that need shipping
  const orders = await db.query.stickerOrders.findMany({
    where: eq(stickerOrders.paymentStatus, "paid"),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      shippingTracking: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Status</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage shipping information and update tracking numbers
        </p>
      </div>

      <ShippingTable orders={orders} adminId={session.user.id} />
    </div>
  );
}
