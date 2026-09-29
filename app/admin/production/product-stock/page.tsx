import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { productInventory } from '@/db/schema';
import { ACRYLIC_SHAPES } from '@/lib/acrylic-shapes';
import { ProductStockManager } from '@/components/admin/product-stock-manager';

export const dynamic = 'force-dynamic';

export default async function ProductStockPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/production/product-stock');

  const inventory = await db.query.productInventory.findMany({ where: eq(productInventory.productKey, 'armor-tag') });
  const inventoryMap = new Map(inventory.map((row) => [row.productVariant, row]));
  const rows = Object.values(ACRYLIC_SHAPES).map((shape) => {
    const row = inventoryMap.get(`acrylic-${shape.key}`);
    return {
      productVariant: `acrylic-${shape.key}`,
      label: shape.label,
      quantityOnHand: row?.quantityOnHand ?? 0,
      lowStockThreshold: row?.lowStockThreshold ?? 3,
    };
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Stok Produk Akrilik</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Atur stok barang jadi per bentuk. Stok dikurangi saat pembayaran order dikonfirmasi.</p>
      </div>
      <ProductStockManager rows={rows} />
    </main>
  );
}
