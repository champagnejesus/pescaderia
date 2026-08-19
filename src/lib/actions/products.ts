"use server";

import { db } from "@/db";
import { products, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const salePrice = parseFloat(formData.get("salePrice") as string);
  const costPrice = parseFloat(formData.get("costPrice") as string) || 0;
  const minStock = parseFloat(formData.get("minStock") as string) || 0;

  if (!name || !unit || !salePrice) {
    return { success: false, error: "Completá todos los campos requeridos" };
  }

  const now = new Date().toISOString();

  try {
    await db.insert(products).values({
      id: crypto.randomUUID(),
      name,
      unit,
      salePrice,
      costPrice,
      minStock,
      stock: 0,
      active: 1,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/products");
    return { success: true, error: undefined };
  } catch (e) {
    return { success: false, error: "Error al guardar el producto" };
  }
}

export async function updateProduct(
  _prev: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const salePrice = parseFloat(formData.get("salePrice") as string);
  const costPrice = parseFloat(formData.get("costPrice") as string) || 0;
  const minStock = parseFloat(formData.get("minStock") as string) || 0;

  if (!id || !name || !unit || !salePrice) {
    return { success: false, error: "Completá todos los campos requeridos" };
  }

  try {
    await db
      .update(products)
      .set({
        name,
        unit,
        salePrice,
        costPrice,
        minStock,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id));

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Error al actualizar el producto" };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await db
    .update(products)
    .set({ active: 0, updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));

  revalidatePath("/products");
}

export async function getProduct(id: string) {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getProducts() {
  return await db
    .select()
    .from(products)
    .where(eq(products.active, 1))
    .orderBy(products.name);
}

export async function getStockMovements(productId: string) {
  return await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(stockMovements.createdAt);
}
