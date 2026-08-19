"use server";

import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getPayments() {
  return await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      method: payments.method,
      amount: payments.amount,
      reference: payments.reference,
      createdAt: payments.createdAt,
      clientName: orders.clientName,
      orderStatus: orders.status,
    })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .orderBy(sql`${payments.createdAt} DESC`);
}

export async function getPaymentsSummary() {
  const rows = await db
    .select({
      method: payments.method,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payments)
    .groupBy(payments.method);

  return {
    cash: rows.find((r) => r.method === "cash")?.total ?? 0,
    cashCount: rows.find((r) => r.method === "cash")?.count ?? 0,
    transfer: rows.find((r) => r.method === "transfer")?.total ?? 0,
    transferCount: rows.find((r) => r.method === "transfer")?.count ?? 0,
    total:
      rows.reduce((sum, r) => sum + r.total, 0),
  };
}
