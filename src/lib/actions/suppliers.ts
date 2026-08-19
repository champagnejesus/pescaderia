"use server";

import { db } from "@/db";
import { suppliers, purchases } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSupplier(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const contact = formData.get("contact") as string;
  const phone = formData.get("phone") as string;
  const notes = formData.get("notes") as string;

  if (!name) {
    return { success: false, error: "El nombre es requerido" };
  }

  const now = new Date().toISOString();

  try {
    await db.insert(suppliers).values({
      id: crypto.randomUUID(),
      name,
      contact: contact || null,
      phone: phone || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/suppliers");
    return { success: true };
  } catch {
    return { success: false, error: "Error al guardar el proveedor" };
  }
}

export async function updateSupplier(_prev: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const contact = formData.get("contact") as string;
  const phone = formData.get("phone") as string;
  const notes = formData.get("notes") as string;

  if (!id || !name) {
    return { success: false, error: "El nombre es requerido" };
  }

  try {
    await db
      .update(suppliers)
      .set({
        name,
        contact: contact || null,
        phone: phone || null,
        notes: notes || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(suppliers.id, id));

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar el proveedor" };
  }
}

export async function deleteSupplier(id: string): Promise<{ success: boolean; error?: string }> {
  const relatedPurchases = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(purchases)
    .where(eq(purchases.supplierId, id));

  if (Number(relatedPurchases[0]?.count ?? 0) > 0) {
    return { success: false, error: "No se puede eliminar: el proveedor tiene compras" };
  }

  try {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    revalidatePath("/suppliers");
    return { success: true };
  } catch (e) {
    console.error("deleteSupplier failed:", e);
    return { success: false, error: "Error al eliminar el proveedor" };
  }
}

export async function getSupplier(id: string) {
  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getSuppliers() {
  return await db
    .select()
    .from(suppliers)
    .orderBy(suppliers.name);
}

export async function getSupplierPurchases(supplierId: string) {
  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.supplierId, supplierId))
    .orderBy(purchases.createdAt);
}
