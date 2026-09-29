import { and, eq } from 'drizzle-orm';
import { productInventory } from '@/db/schema';

export const ACRYLIC_VARIANTS = [
  'acrylic-circle',
  'acrylic-oval',
  'acrylic-octagon',
  'acrylic-heart',
  'acrylic-rectangle',
  'acrylic-rectangle-motif',
  'acrylic-square',
  'acrylic-rectangle-emboss',
] as const;

export type AcrylicVariant = (typeof ACRYLIC_VARIANTS)[number];

export function isAcrylicVariant(value: string | null | undefined): value is AcrylicVariant {
  return !!value && ACRYLIC_VARIANTS.includes(value as AcrylicVariant);
}

export async function getAcrylicStock() {
  return dbQuery().then((rows) => new Map(rows.map((row) => [row.productVariant, row.quantityOnHand])));
}

async function dbQuery() {
  const { db } = await import('@/db');
  return db.query.productInventory.findMany({
    where: eq(productInventory.productKey, 'armor-tag'),
  });
}

export async function consumeAcrylicStock(tx: any, productVariant: string | null, quantity: number) {
  if (!isAcrylicVariant(productVariant)) return false;

  const rows = await tx
    .select()
    .from(productInventory)
    .where(and(
      eq(productInventory.app_id, 'balikin_id'),
      eq(productInventory.productKey, 'armor-tag'),
      eq(productInventory.productVariant, productVariant),
    ))
    .for('update');
  const stock = rows[0];

  if (!stock || stock.quantityOnHand < quantity) return false;

  await tx
    .update(productInventory)
    .set({
      quantityOnHand: stock.quantityOnHand - quantity,
      updatedAt: new Date(),
    })
    .where(eq(productInventory.id, stock.id));

  return true;
}
