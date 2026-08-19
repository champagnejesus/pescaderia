import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  salePrice: real("sale_price").notNull(),
  costPrice: real("cost_price").notNull().default(0),
  stock: real("stock").notNull().default(0),
  minStock: real("min_stock").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id),
  clientName: text("client_name"),
  status: text("status").notNull().default("pending"),
  total: real("total").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  subtotal: real("subtotal").notNull(),
  createdAt: text("created_at").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  method: text("method").notNull(),
  amount: real("amount").notNull(),
  reference: text("reference"),
  createdAt: text("created_at").notNull(),
});

export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id").references(() => suppliers.id),
  invoice: text("invoice"),
  total: real("total").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const purchaseItems = sqliteTable("purchase_items", {
  id: text("id").primaryKey(),
  purchaseId: text("purchase_id").notNull().references(() => purchases.id),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: real("quantity").notNull(),
  unitCost: real("unit_cost").notNull(),
  subtotal: real("subtotal").notNull(),
  createdAt: text("created_at").notNull(),
});

export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  type: text("type").notNull(),
  referenceId: text("reference_id"),
  quantity: real("quantity").notNull(),
  balanceAfter: real("balance_after").notNull(),
  createdAt: text("created_at").notNull(),
});

export const dailyCloses = sqliteTable("daily_closes", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  totalSales: real("total_sales").notNull(),
  totalPurchases: real("total_purchases").notNull().default(0),
  totalCash: real("total_cash").notNull(),
  totalTransfer: real("total_transfer").notNull(),
  grossProfit: real("gross_profit").notNull(),
  orderCount: integer("order_count").notNull(),
  closedAt: text("closed_at").notNull(),
});
