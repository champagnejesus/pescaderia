"use server";

import { db } from "@/db";
import {
  products,
  customers,
  suppliers,
  orders,
  payments,
  dailyCloses,
  stockMovements,
} from "@/db/schema";
import { eq, gte, lte, sql } from "drizzle-orm";

export async function exportProducts() {
  try {
    const data = await db
      .select()
      .from(products)
      .where(eq(products.active, 1))
      .orderBy(products.name);

    return data.map((p) => ({
      name: p.name,
      unit: p.unit,
      stock: p.stock,
      minStock: p.minStock,
      salePrice: p.salePrice,
      costPrice: p.costPrice,
      createdAt: p.createdAt,
    }));
  } catch (e) {
    console.error("exportProducts failed:", e);
    return [];
  }
}

export async function exportCustomers() {
  try {
    const data = await db
      .select()
      .from(customers)
      .orderBy(customers.name);

    return data.map((c) => ({
      name: c.name,
      phone: c.phone ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
      createdAt: c.createdAt,
    }));
  } catch (e) {
    console.error("exportCustomers failed:", e);
    return [];
  }
}

export async function exportSuppliers() {
  try {
    const data = await db
      .select()
      .from(suppliers)
      .orderBy(suppliers.name);

    return data.map((s) => ({
      name: s.name,
      contact: s.contact ?? "",
      phone: s.phone ?? "",
      notes: s.notes ?? "",
      createdAt: s.createdAt,
    }));
  } catch (e) {
    console.error("exportSuppliers failed:", e);
    return [];
  }
}

export async function exportOrders(from?: string, to?: string) {
  try {
    const conditions = [sql`1=1`];
    if (from) conditions.push(gte(orders.createdAt, from));
    if (to) conditions.push(lte(orders.createdAt, to));

    const data = await db
      .select({
        id: orders.id,
        clientName: orders.clientName,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(sql.join(conditions, sql` AND `))
      .orderBy(orders.createdAt);

    return data.map((o) => ({
      id: o.id.slice(0, 8),
      client: o.clientName ?? "",
      status: o.status,
      total: o.total,
      date: o.createdAt,
    }));
  } catch (e) {
    console.error("exportOrders failed:", e);
    return [];
  }
}

export async function exportPayments(from?: string, to?: string) {
  try {
    const conditions = [sql`1=1`];
    if (from) conditions.push(gte(payments.createdAt, from));
    if (to) conditions.push(lte(payments.createdAt, to));

    const data = await db
      .select({
        orderId: payments.orderId,
        method: payments.method,
        amount: payments.amount,
        reference: payments.reference,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(sql.join(conditions, sql` AND `))
      .orderBy(payments.createdAt);

    return data.map((p) => ({
      order: p.orderId.slice(0, 8),
      method: p.method === "cash" ? "Efectivo" : "Transferencia",
      amount: p.amount,
      reference: p.reference ?? "",
      date: p.createdAt,
    }));
  } catch (e) {
    console.error("exportPayments failed:", e);
    return [];
  }
}

export async function exportDailyCloses() {
  try {
    const data = await db
      .select()
      .from(dailyCloses)
      .orderBy(dailyCloses.date);

    return data.map((d) => ({
      date: d.date,
      sales: d.totalSales,
      purchases: d.totalPurchases,
      cash: d.totalCash,
      transfer: d.totalTransfer,
      profit: d.grossProfit,
      orders: d.orderCount,
      closedAt: d.closedAt,
    }));
  } catch (e) {
    console.error("exportDailyCloses failed:", e);
    return [];
  }
}

export async function exportStockMovements(productId?: string) {
  try {
    const conditions = [sql`1=1`];
    if (productId) conditions.push(eq(stockMovements.productId, productId));

    const data = await db
      .select()
      .from(stockMovements)
      .where(sql.join(conditions, sql` AND `))
      .orderBy(stockMovements.createdAt);

    return data.map((m) => ({
      product: m.productId.slice(0, 8),
      type: m.type === "in" ? "Entrada" : m.type === "out" ? "Salida" : m.type,
      qty: m.quantity,
      balance: m.balanceAfter,
      date: m.createdAt,
    }));
  } catch (e) {
    console.error("exportStockMovements failed:", e);
    return [];
  }
}
