import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function StockAlert() {
  const lowStock = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(sql`${products.active} = 1 AND ${products.stock} <= ${products.minStock}`);

  const count = Number(lowStock[0]?.count ?? 0);

  if (count === 0) return null;

  return (
    <Link
      href="/products?filter=low-stock"
      className="flex items-center gap-1 text-xs font-medium text-[#FFD60A] bg-[#FFD60A]/15 px-2.5 py-1 rounded-full"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD60A]" />
      {count} sin stock
    </Link>
  );
}
