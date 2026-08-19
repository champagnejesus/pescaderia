"use server";

import { db } from "@/db";
import { dailyCloses, orders, payments, purchases, orderItems, products } from "@/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function todayDateStr() {
  const d = new Date();
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
}

function todayStartISO() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(new Date());
  return new Date(dateStr + "T00:00:00-03:00").toISOString();
}

export async function getTodaySummary() {
  const today = todayStartISO();

  const [salesResult, purchasesResult, paymentsResult, existingClose, grossProfitResult] =
    await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, today), sql`${orders.status} != 'cancelled'`))
        .limit(1),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${purchases.total}), 0)`,
        })
        .from(purchases)
        .where(gte(purchases.createdAt, today))
        .limit(1),

      db
        .select({
          method: payments.method,
          total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(gte(payments.createdAt, today))
        .groupBy(payments.method),

      db
        .select()
        .from(dailyCloses)
        .where(eq(dailyCloses.date, todayDateStr()))
        .limit(1),

      db
        .select({
          costTotal: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${products.costPrice}), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(gte(orders.createdAt, today), sql`${orders.status} != 'cancelled'`))
        .limit(1),
    ]);

  const salesTotal = salesResult[0]?.total ?? 0;
  const salesCount = salesResult[0]?.count ?? 0;
  const purchasesTotal = purchasesResult[0]?.total ?? 0;
  const cashTotal = paymentsResult.find((p) => p.method === "cash")?.total ?? 0;
  const transferTotal = paymentsResult.find((p) => p.method === "transfer")?.total ?? 0;
  const costOfGoodsSold = grossProfitResult[0]?.costTotal ?? 0;

  return {
    salesTotal,
    salesCount,
    purchasesTotal,
    cashTotal,
    transferTotal,
    grossProfit: salesTotal - costOfGoodsSold,
    isClosed: existingClose.length > 0,
    existingClose: existingClose[0] ?? null,
  };
}

export async function closeDay() {
  const summary = await getTodaySummary();

  if (summary.isClosed) {
    return { success: false, error: "El día ya fue cerrado" };
  }

  const date = todayDateStr();

  try {
    await db.insert(dailyCloses).values({
      id: crypto.randomUUID(),
      date,
      totalSales: summary.salesTotal,
      totalPurchases: summary.purchasesTotal,
      totalCash: summary.cashTotal,
      totalTransfer: summary.transferTotal,
      grossProfit: summary.grossProfit,
      orderCount: summary.salesCount,
      closedAt: new Date().toISOString(),
    });

    revalidatePath("/close");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("closeDay failed:", e);
    return { success: false, error: "Error al cerrar el día" };
  }
}

export async function getCloseHistory() {
  return await db
    .select()
    .from(dailyCloses)
    .orderBy(sql`${dailyCloses.date} DESC`);
}
