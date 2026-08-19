"use server";

import { db } from "@/db";
import { orders, orderItems, payments, products, stockMovements } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const clientName = formData.get("clientName") as string;
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;
  const cashAmount = parseFloat(formData.get("cashAmount") as string) || 0;
  const transferAmount = parseFloat(formData.get("transferAmount") as string) || 0;

  if (!itemsJson) {
    return { success: false, error: "Agregá al menos un producto" };
  }

  let items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { success: false, error: "Error al procesar los productos" };
  }

  if (items.length === 0) {
    return { success: false, error: "Agregá al menos un producto" };
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  if (Math.abs(cashAmount + transferAmount - total) > 0.01) {
    return {
      success: false,
      error: `El total de pagos ($${(cashAmount + transferAmount).toFixed(2)}) debe ser igual al total del pedido ($${total.toFixed(2)})`,
    };
  }

  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();

  try {
    const productIds = items.map((i) => i.productId);
    const productRows = await db
      .select({ id: products.id, stock: products.stock })
      .from(products)
      .where(inArray(products.id, productIds));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return { success: false, error: `Producto no encontrado: ${item.productId}` };
      }
      if (prod.stock < item.quantity) {
        return { success: false, error: `Stock insuficiente para el producto seleccionado` };
      }
    }

    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        customerId: customerId || null,
        clientName: clientName || null,
        status: "pending",
        total,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      });

      for (const item of items) {
        const itemId = crypto.randomUUID();
        const subtotal = item.quantity * item.unitPrice;

        await tx.insert(orderItems).values({
          id: itemId,
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal,
          createdAt: now,
        });

        const prod = productMap.get(item.productId)!;
        const newStock = prod.stock - item.quantity;

        await tx
          .update(products)
          .set({ stock: newStock, updatedAt: now })
          .where(eq(products.id, item.productId));

        await tx.insert(stockMovements).values({
          id: crypto.randomUUID(),
          productId: item.productId,
          type: "sale",
          referenceId: orderId,
          quantity: -item.quantity,
          balanceAfter: newStock,
          createdAt: now,
        });
      }

      if (cashAmount > 0) {
        await tx.insert(payments).values({
          id: crypto.randomUUID(),
          orderId,
          method: "cash",
          amount: cashAmount,
          reference: null,
          createdAt: now,
        });
      }

      if (transferAmount > 0) {
        await tx.insert(payments).values({
          id: crypto.randomUUID(),
          orderId,
          method: "transfer",
          amount: transferAmount,
          reference: null,
          createdAt: now,
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("createOrder failed:", e);
    return { success: false, error: "Error al crear el pedido" };
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await db
    .update(orders)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(orders.id, orderId));

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function cancelOrder(orderId: string): Promise<void> {
  const now = new Date().toISOString();

  try {
    const existingItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    if (existingItems.length > 0) {
      const productIds = existingItems.map((i) => i.productId);
      const productRows = await db
        .select({ id: products.id, stock: products.stock })
        .from(products)
        .where(inArray(products.id, productIds));
      const productMap = new Map(productRows.map((p) => [p.id, p.stock]));

      await db.transaction(async (tx) => {
        for (const item of existingItems) {
          const currentStock = productMap.get(item.productId) ?? 0;
          const newStock = currentStock + item.quantity;

          await tx
            .update(products)
            .set({ stock: newStock, updatedAt: now })
            .where(eq(products.id, item.productId));

          await tx.insert(stockMovements).values({
            id: crypto.randomUUID(),
            productId: item.productId,
            type: "cancellation",
            referenceId: orderId,
            quantity: item.quantity,
            balanceAfter: newStock,
            createdAt: now,
          });
        }

        await tx
          .update(orders)
          .set({ status: "cancelled", updatedAt: now })
          .where(eq(orders.id, orderId));
      });
    } else {
      await db
        .update(orders)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(orders.id, orderId));
    }
  } catch (e) {
    console.error("cancelOrder failed:", e);
    throw new Error("Error al anular el pedido");
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
}

export async function getOrders() {
  return await db.select().from(orders).orderBy(orders.createdAt);
}

export async function getOrder(id: string) {
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getOrderItems(orderId: string) {
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.createdAt);
}

export async function getOrderPayments(orderId: string) {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(payments.createdAt);
}
