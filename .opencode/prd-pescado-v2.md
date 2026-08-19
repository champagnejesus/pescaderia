# PRD v2: ERP Pescadería — Gestión Integral del Negocio

> **Estado:** Borrador v2 — scope expandido  
> **Rol:** office-hours (CEO/PM)

---

## 1. Elevator Pitch

Una sola app donde el pescaderos tiene todo su negocio: tomar pedidos, controlar stock, registrar clientes y proveedores, llevar las compras de mercadería, y cerrar caja. Reemplaza papel, WhatsApp, memoria y cuadernos por una app mobile-first que funciona en el celular del puesto.

---

## 2. Módulos del Sistema

```
┌─────────────────────────────────────────────┐
│              ERP Pescadería                   │
├──────────┬──────────┬──────────┬────────────┤
│  VENTAS   │ COMPRAS  │  STOCK   │  CAJA      │
│           │          │          │            │
│ • Pedidos │ • Compras│ • Prod.  │ • Dashboard│
│ • Clientes│ • Provee.│ • Movim. │ • Cierre   │
│ • Cobros  │          │ • Alertas│ • Historial│
└──────────┴──────────┴──────────┴────────────┘
```

---

## 3. Features Completas

### 3.1 Clientes (`/customers`)
Quién le compra al puesto.
- Registro: nombre, teléfono, dirección (opcional), notas (ej. "paga siempre a los 15 días")
- Historial de pedidos del cliente
- Búsqueda rápida por nombre o teléfono
- Pedidos recurrentes (ej. "todos los viernes 2kg de merluza")

### 3.2 Proveedores (`/suppliers`)
A quién le compra mercadería.
- Registro: nombre, contacto, teléfono, notas
- Historial de compras por proveedor
- Precios por producto que maneja ese proveedor

### 3.3 Compras (`/purchases`)
Registro de mercadería que ingresa.
- Seleccionar proveedor
- Agregar items (producto + cantidad + precio de compra)
- La compra **aumenta el stock** automáticamente
- Fecha, número de factura o remito (opcional)
- Costo total de la compra

### 3.4 Productos / Stock (`/products`)
- Nombre, unidad (kg, unidad, docena), precio de venta, precio de compra, stock actual, stock mínimo
- Alerta visual verde/amarillo/rojo
- Historial de movimientos: cada compra (+stock) y cada venta (-stock) queda registrada

### 3.5 Ventas / Pedidos (`/orders`)
- Tomar pedido por teléfono (seleccionar cliente o nuevo, productos, cantidades)
- Descuento automático de stock (transaccional)
- Estados: Pendiente → Entregado / Anulado
- Split de pago: efectivo + transferencia en un mismo pedido
- Al entregar, se puede marcar como pagado

### 3.6 Dashboard (`/dashboard`)
- Resumen del día: ventas, gastos en compras, ganancia estimada
- Pedidos pendientes
- Stock bajo (alertas)
- Clientes que pidieron hoy
- Acceso rápido a todas las funciones

### 3.7 Cierre de Caja (`/close`)
- Total ventas, total compras del día, total efectivo, total transferencia
- Diferencia: ganancia bruta del día
- Historial de cierres anteriores
```

---

## 4. Modelo de Datos (Actualizado)

```sql
-- Productos
CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  unit          TEXT NOT NULL,           -- "kg", "unidad", "docena"
  sale_price    REAL NOT NULL,           -- precio de venta al público
  cost_price    REAL NOT NULL DEFAULT 0, -- precio de compra (para saber ganancia)
  stock         REAL NOT NULL DEFAULT 0,
  min_stock     REAL NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Clientes
CREATE TABLE customers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT,
  address       TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Proveedores
CREATE TABLE suppliers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  contact       TEXT,                    -- nombre de la persona de contacto
  phone         TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Pedidos (ventas)
CREATE TABLE orders (
  id            TEXT PRIMARY KEY,
  customer_id   TEXT REFERENCES customers(id),
  client_name   TEXT,                    -- si es venta sin cliente registrado
  status        TEXT NOT NULL DEFAULT 'pending',
  total         REAL NOT NULL,
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Items del pedido (venta)
CREATE TABLE order_items (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  product_id    TEXT NOT NULL REFERENCES products(id),
  quantity      REAL NOT NULL,
  unit_price    REAL NOT NULL,
  subtotal      REAL NOT NULL,
  created_at    TEXT NOT NULL
);

-- Pagos de pedidos
CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  method        TEXT NOT NULL,           -- "cash" | "transfer"
  amount        REAL NOT NULL,
  reference     TEXT,
  created_at    TEXT NOT NULL
);

-- Compras a proveedores
CREATE TABLE purchases (
  id            TEXT PRIMARY KEY,
  supplier_id   TEXT REFERENCES suppliers(id),
  invoice       TEXT,                    -- número de factura/remito
  total         REAL NOT NULL,
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Items de la compra
CREATE TABLE purchase_items (
  id            TEXT PRIMARY KEY,
  purchase_id   TEXT NOT NULL REFERENCES purchases(id),
  product_id    TEXT NOT NULL REFERENCES products(id),
  quantity      REAL NOT NULL,
  unit_cost     REAL NOT NULL,           -- precio pagado al proveedor
  subtotal      REAL NOT NULL,
  created_at    TEXT NOT NULL
);

-- Movimientos de stock (auditoría)
CREATE TABLE stock_movements (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id),
  type          TEXT NOT NULL,           -- "purchase" | "sale" | "cancellation" | "adjustment"
  reference_id  TEXT,                    -- order_id o purchase_id
  quantity      REAL NOT NULL,           -- positiva (entra) o negativa (sale)
  balance_after REAL NOT NULL,           -- stock después del movimiento
  created_at    TEXT NOT NULL
);

-- Cierres de caja
CREATE TABLE daily_closes (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL UNIQUE,
  total_sales   REAL NOT NULL,
  total_purchases REAL NOT NULL DEFAULT 0,
  total_cash    REAL NOT NULL,
  total_transfer REAL NOT NULL,
  gross_profit  REAL NOT NULL,           -- ventas - costo de lo vendido (estimado)
  order_count   INTEGER NOT NULL,
  closed_at     TEXT NOT NULL
);
```

### Diagrama de relaciones

```
suppliers ──< purchases ──< purchase_items >── products
                                                    │
customers ──< orders ──< order_items >──────────────┘
                │
                └──< payments

stock_movements ──> products (cada compra/venta registra un movimiento)
```

---

## 5. Flujos Nuevos

### 5.1 Comprar mercadería
1. Llega el proveedor con la mercadería
2. Abrir app → "Nueva Compra"
3. Seleccionar proveedor (o crear rápido)
4. Agregar productos + cantidades + precio de compra
5. Confirmar → se **aumenta el stock** y se registra el movimiento
6. Queda en el historial del proveedor

### 5.2 Registrar cliente durante pedido
1. Empleado toma pedido por teléfono
2. Pregunta nombre → escribe en el campo "Cliente"
3. Si ya existe, autocompleta
4. Si no, lo crea sobre la marcha (nombre + teléfono)
5. Después queda en el registro de clientes para futuros pedidos

---

## 6. Stack (sin cambios)

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14+ + Tailwind + shadcn/ui |
| DB | Turso (libSQL) + Drizzle ORM |
| Auth | NextAuth v5 |
| Formularios | React Hook Form + Zod |
| PWA | @serwist/next |
| Hosting | Railway o Fly.io |

---

## 7. Plan de Implementación v2

| Paso | Feature | Depende de |
|------|---------|-----------|
| 1 | Setup: Next.js + Tailwind + Drizzle + Turso | — |
| 2 | Auth | Paso 1 |
| 3 | CRUD Productos + vista stock con colores | Paso 2 |
| 4 | CRUD Clientes | Paso 2 |
| 5 | CRUD Proveedores | Paso 2 |
| 6 | Registrar Compra (+stock automático) | Pasos 3, 5 |
| 7 | Tomar Pedido (-stock automático transaccional) | Pasos 3, 4 |
| 8 | Lista de pedidos + cambiar estado | Paso 7 |
| 9 | Pagos (efectivo/transferencia) | Paso 8 |
| 10 | Dashboard con resumen del día | Pasos 6, 9 |
| 11 | Cierre de caja diario | Paso 10 |
| 12 | PWA + deploy | Paso 11 |
