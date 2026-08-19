"use server";

import { db } from "@/db";
import { orders, payments, purchases, products, orderItems } from "@/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";

function todayStart() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(new Date());
  return new Date(dateStr + "T00:00:00-03:00").toISOString();
}

export async function getDashboardData() {
  const today = todayStart();

  const [todayOrders, todayPayments, todayPurchases, pendingOrders, lowStock, recentOrders, grossProfitResult] =
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
          method: payments.method,
          total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(gte(payments.createdAt, today))
        .groupBy(payments.method),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${purchases.total}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(purchases)
        .where(gte(purchases.createdAt, today))
        .limit(1),

      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(eq(orders.status, "pending"))
        .limit(1),

      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(and(eq(products.active, 1), sql`${products.stock} <= ${products.minStock}`))
        .limit(1),

      db
        .select({
          id: orders.id,
          clientName: orders.clientName,
          total: orders.total,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(sql`${orders.createdAt} DESC`)
        .limit(5),

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

  const salesTotal = todayOrders[0]?.total ?? 0;
  const salesCount = todayOrders[0]?.count ?? 0;
  const purchasesTotal = todayPurchases[0]?.total ?? 0;
  const purchasesCount = todayPurchases[0]?.count ?? 0;
  const pendingCount = pendingOrders[0]?.count ?? 0;
  const lowStockCount = lowStock[0]?.count ?? 0;

  const cashTotal = todayPayments.find((p) => p.method === "cash")?.total ?? 0;
  const transferTotal = todayPayments.find((p) => p.method === "transfer")?.total ?? 0;
  const costOfGoodsSold = grossProfitResult[0]?.costTotal ?? 0;

  return {
    salesTotal,
    salesCount,
    purchasesTotal,
    purchasesCount,
    cashTotal,
    transferTotal,
    pendingCount,
    lowStockCount,
    grossProfit: salesTotal - costOfGoodsSold,
    recentOrders,
  };
}
