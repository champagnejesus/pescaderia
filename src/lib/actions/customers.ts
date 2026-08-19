"use server";

import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCustomer(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  if (!name) {
    return { success: false, error: "El nombre es requerido" };
  }

  const now = new Date().toISOString();

  try {
    await db.insert(customers).values({
      id: crypto.randomUUID(),
      name,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/customers");
    return { success: true };
  } catch {
    return { success: false, error: "Error al guardar el cliente" };
  }
}

export async function updateCustomer(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  if (!id || !name) {
    return { success: false, error: "El nombre es requerido" };
  }

  try {
    await db
      .update(customers)
      .set({
        name,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customers.id, id));

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el cliente" };
  }
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  const relatedOrders = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.customerId, id));

  if (Number(relatedOrders[0]?.count ?? 0) > 0) {
    return { success: false, error: "No se puede eliminar: el cliente tiene pedidos" };
  }

  try {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/customers");
    return { success: true };
  } catch (e) {
    console.error("deleteCustomer failed:", e);
    return { success: false, error: "Error al eliminar el cliente" };
  }
}

export async function getCustomer(id: string) {
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomers() {
  return await db
    .select()
    .from(customers)
    .orderBy(customers.name);
}

export async function getCustomerOrders(customerId: string) {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(orders.createdAt);
}
