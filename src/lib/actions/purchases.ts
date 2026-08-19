"use server";

import { db } from "@/db";
import { purchases, purchaseItems, products, stockMovements } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPurchase(formData: FormData) {
  const supplierId = formData.get("supplierId") as string;
  const invoice = formData.get("invoice") as string;
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;

  if (!itemsJson) {
    return { success: false, error: "Agregá al menos un producto" };
  }

  let items: Array<{ productId: string; quantity: number; unitCost: number }>;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { success: false, error: "Error al procesar los productos" };
  }

  if (items.length === 0) {
    return { success: false, error: "Agregá al menos un producto" };
  }

  const now = new Date().toISOString();
  const purchaseId = crypto.randomUUID();
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  try {
    const productIds = items.map((i) => i.productId);
    const productRows = await db
      .select({ id: products.id, stock: products.stock, costPrice: products.costPrice })
      .from(products)
      .where(inArray(products.id, productIds));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    await db.transaction(async (tx) => {
      await tx.insert(purchases).values({
        id: purchaseId,
        supplierId: supplierId || null,
        invoice: invoice || null,
        notes: notes || null,
        total,
        createdAt: now,
        updatedAt: now,
      });

      for (const item of items) {
        const itemId = crypto.randomUUID();
        const subtotal = item.quantity * item.unitCost;

        await tx.insert(purchaseItems).values({
          id: itemId,
          purchaseId,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal,
          createdAt: now,
        });

        const existing = productMap.get(item.productId);
        if (existing) {
          const newStock = existing.stock + item.quantity;
          const newCostPrice =
            existing.stock > 0
              ? (existing.stock * existing.costPrice + item.quantity * item.unitCost) / newStock
              : item.unitCost;

          await tx
            .update(products)
            .set({
              stock: newStock,
              costPrice: newCostPrice,
              updatedAt: now,
            })
            .where(eq(products.id, item.productId));

          await tx.insert(stockMovements).values({
            id: crypto.randomUUID(),
            productId: item.productId,
            type: "purchase",
            referenceId: purchaseId,
            quantity: item.quantity,
            balanceAfter: newStock,
            createdAt: now,
          });
        }
      }
    });

    revalidatePath("/purchases");
    revalidatePath("/products");
    return { success: true };
  } catch (e) {
    console.error("createPurchase failed:", e);
    return { success: false, error: "Error al registrar la compra" };
  }
}

export async function getPurchases() {
  return await db.select().from(purchases).orderBy(purchases.createdAt);
}

export async function getPurchase(id: string) {
  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getPurchaseItems(purchaseId: string) {
  return await db
    .select()
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, purchaseId))
    .orderBy(purchaseItems.createdAt);
}
