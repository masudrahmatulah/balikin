'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { productInventory } from '@/db/schema';
import { isAcrylicVariant } from '@/lib/product-stock';

const APP_ID = 'balikin_id';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/production/product-stock');
  return session;
}

export async function setAcrylicStock(productVariant: string, quantity: number) {
  await requireAdmin();

  if (!isAcrylicVariant(productVariant)) throw new Error('Varian akrilik tidak valid');
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 100000) {
    throw new Error('Jumlah stok harus antara 0 dan 100.000');
  }

  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: productInventory.id })
      .from(productInventory)
      .where(and(
        eq(productInventory.app_id, APP_ID),
        eq(productInventory.productKey, 'armor-tag'),
        eq(productInventory.productVariant, productVariant),
      ))
      .for('update');

    const stock = rows[0];
    if (!stock) throw new Error('Baris stok varian belum tersedia');

    await tx.update(productInventory)
      .set({ quantityOnHand: quantity, updatedAt: new Date() })
      .where(eq(productInventory.id, stock.id));
  });

  revalidatePath('/admin/production/product-stock');
  revalidatePath('/produk');
}
