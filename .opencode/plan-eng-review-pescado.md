# Plan-Eng-Review: Gestión de Ventas para Pescadería

> **Estado:** Revisión de arquitectura  
> **Proyecto:** Greenfield — sin código existente  
> **Stack:** Next.js 14+ (App Router) + Tailwind CSS + Turso/SQLite + NextAuth

---

## 1. Modelo de Datos

```sql
-- Productos del negocio
CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,           -- "Merluza", "Langostinos", etc.
  unit          TEXT NOT NULL,           -- "kg", "unidad", "docena"
  price         REAL NOT NULL,           -- precio de venta por unidad
  stock         REAL NOT NULL DEFAULT 0, -- cantidad actual en inventario
  min_stock     REAL NOT NULL DEFAULT 0, -- umbral para alerta de stock bajo
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL
);

-- Pedidos (una llamada telefónica = un pedido)
CREATE TABLE orders (
  id            TEXT PRIMARY KEY,
  client_name   TEXT,                    -- nombre opcional del cliente
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | delivered | cancelled
  total         REAL NOT NULL,           -- suma de todos los items
  notes         TEXT,                    -- observaciones del empleado
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Items dentro de un pedido
CREATE TABLE order_items (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  product_id    TEXT NOT NULL REFERENCES products(id),
  quantity      REAL NOT NULL,           -- ej: 1.5 (kg)
  unit_price    REAL NOT NULL,           -- precio en el momento de la venta
  subtotal      REAL NOT NULL,           -- quantity * unit_price
  created_at    TEXT NOT NULL
);

-- Pagos (un pedido puede tener split de pago)
CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  method        TEXT NOT NULL,           -- "cash" | "transfer"
  amount        REAL NOT NULL,
  reference     TEXT,                    -- alias/CBU si es transferencia
  created_at    TEXT NOT NULL
);

-- Cierres de caja diarios
CREATE TABLE daily_closes (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL UNIQUE,    -- "2026-07-13"
  total_sales   REAL NOT NULL,
  total_cash    REAL NOT NULL,
  total_transfer REAL NOT NULL,
  order_count   INTEGER NOT NULL,
  closed_at     TEXT NOT NULL
);
```

### Diagrama de relaciones

```
products ──< order_items >── orders ──< payments
```

Un **pedido** tiene N items y N pagos.  
Al crear un item, se descuenta `stock` del producto.  
Al anular un pedido, se devuelve el stock.

---

## 2. Arquitectura — Next.js App Router

```
src/
├── app/
│   ├── layout.tsx            -- Layout general + Providers
│   ├── page.tsx              -- Login / Landing
│   ├── dashboard/
│   │   ├── page.tsx          -- Resumen del día + acceso rápido
│   │   └── loading.tsx
│   ├── products/
│   │   ├── page.tsx          -- Lista + stock en tiempo real
│   │   ├── new/page.tsx      -- Crear producto
│   │   └── [id]/page.tsx     -- Editar producto
│   ├── orders/
│   │   ├── page.tsx          -- Pedidos del día (pending/delivered)
│   │   ├── new/page.tsx      -- Tomar pedido (el core)
│   │   └── [id]/page.tsx     -- Detalle del pedido
│   └── close/
│       └── page.tsx          -- Cierre del día
├── components/
│   ├── ui/                   -- Design system atómico
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx         -- Estado del pedido / alerta stock
│   │   └── modal.tsx
│   ├── products/
│   │   ├── product-card.tsx  -- Card con nombre + stock + precio
│   │   └── stock-badge.tsx   -- Verde / Amarillo / Rojo
│   ├── orders/
│   │   ├── order-form.tsx    -- Formulario principal de pedido
│   │   ├── order-list.tsx    -- Lista de pedidos del día
│   │   └── payment-selector.tsx -- Efectivo / Transferencia + monto
│   └── close/
│       └── close-summary.tsx -- Resumen de cierre
├── lib/
│   ├── db.ts                 -- Conexión a Turso / SQLite
│   ├── queries/
│   │   ├── products.ts       -- CRUD productos
│   │   ├── orders.ts         -- CRUD pedidos + descuento stock
│   │   └── close.ts          -- Lógica de cierre de caja
│   ├── utils/
│   │   ├── currency.ts       -- Formateo de pesos
│   │   └── datetime.ts       -- Fechas en locale argentino
│   └── validations.ts        -- Esquemas Zod para forms
├── hooks/
│   ├── use-stock.ts          -- SWR / React Query para stock
│   └── use-orders.ts
└── types/
    └── index.ts              -- Types compartidos
```

---

## 3. Flujo Crítico: Tomar Pedido

```
[Empleado recibe llamada]
       │
       ▼
Abre app → ve dashboard con resumen del día
       │
       ▼
Toca "+ Nuevo Pedido"
       │
       ▼
Ve lista de productos con stock actual (verde/amarillo/rojo)
       │
       ▼
Toca producto → selecciona cantidad (input numérico)
       │
       ▼
Repite hasta completar el pedido
       │
       ▼
Opcional: escribe nombre del cliente + notas
       │
       ▼
Toca "Confirmar Pedido"
       │
       ├── Stock suficiente → se descuenta del inventario
       │                      → pedido queda "Pendiente"
       │                      → redirige a lista de pedidos
       │
       └── Stock insuficiente → alerta: "Solo quedan X kg"
                                → puede vender lo que hay o cancelar
```

### Descuento de stock — transaccional

```typescript
async function createOrder(data: CreateOrderInput) {
  return db.transaction(async (tx) => {
    // 1. Verificar stock de cada item
    for (const item of data.items) {
      const product = await tx.getProduct(item.productId);
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente: ${product.name}`);
      }
    }

    // 2. Crear pedido + items
    const order = await tx.createOrder(data);

    // 3. Descontar stock
    for (const item of data.items) {
      await tx.updateStock(item.productId, -item.quantity);
    }

    return order;
  });
}
```

---

## 4. Decisiones Técnicas

| Decisión | Opción | Por qué |
|----------|--------|---------|
| Base de datos | Turso (libSQL) | SQLite distribuido, embedable, gratis, tipo seguro con Drizzle |
| ORM | Drizzle ORM | Tipado nativo en TypeScript, performante, migraciones simples |
| Auth | NextAuth v5 (Auth.js) | Email+contraseña con adapter para Turso |
| Formularios | React Hook Form + Zod | Validación tipada, performante en mobile |
| Estado del servidor | TanStack Query (React Query) | Cache, refetch, loading states sin boilerplate |
| PWA | @serwist/next | Service worker offline, instalable en el celular |
| UI | Tailwind CSS + shadcn/ui | Atómico, rápido, mobile-first |
| Hosting | Railway o Fly.io | Soporte nativo de Turso, región Argentina |

---

## 5. Pantallas (Wireframes en texto)

### 5.1 Dashboard (`/dashboard`)
```
┌─────────────────────────────────┐
│  🐟 Mi Pescadería       Hoy     │
├─────────────────────────────────┤
│  Vendido hoy:   $45.200         │
│  Pedidos:       12 (3 pend.)    │
│  Efectivo:      $28.500         │
│  Transferencia: $16.700         │
├─────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐     │
│  │ Productos │ │ Pedidos  │     │
│  │ Stock     │ │ del día  │     │
│  └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐     │
│  │ + Nuevo  │ │ Cerrar   │     │
│  │ Pedido   │ │ Caja     │     │
│  └──────────┘ └──────────┘     │
└─────────────────────────────────┘
```

### 5.2 Tomar Pedido (`/orders/new`)
```
┌─────────────────────────────────┐
│  ← Volver    Nuevo Pedido       │
├─────────────────────────────────┤
│  Cliente: [________________]    │
├─────────────────────────────────┤
│  Buscar producto...             │
├─────────────────────────────────┤
│  Merluza      $850/kg  🟢 12kg │
│  Langostinos  $1200/kg 🟡 4kg  │
│  Calamares    $700/kg  🔴 0kg  │
│  Filet de    $950/kg  🟢 8kg   │
│  Merluza                         │
│  ...                             │
├─────────────────────────────────┤
│  Items:                          │
│  Merluza          2.5kg $2.125  │
│  Langostinos      1.0kg $1.200  │
│  ───────────────────────────    │
│  Total:                 $3.325  │
│  Pago:  ○ Efectivo  ● Transf.  │
│                              │
│  [✅ Confirmar Pedido]          │
└─────────────────────────────────┘
```

### 5.3 Stock (`/products`)
```
┌─────────────────────────────────┐
│  ← Volver    Productos          │
├─────────────────────────────────┤
│  [Buscar...                🔍]  │
├─────────────────────────────────┤
│  🟢 Merluza          12.0 kg   │
│     $850/kg                     │
│  🟡 Langostinos       4.0 kg   │
│     $1.200/kg                   │
│  🔴 Calamares         0.0 kg   │
│     $700/kg                     │
│  🟢 Filet de Merluza  8.0 kg   │
│     $950/kg                     │
│  🟢 Rabas             6.0 kg   │
│     $1.100/kg                   │
├─────────────────────────────────┤
│  [+ Agregar Producto]           │
└─────────────────────────────────┘
```

---

## 6. Plan de Implementación (por orden)

| Paso | Feature | Depende de |
|------|---------|-----------|
| 1 | Setup: Next.js + Tailwind + Drizzle + Turso | — |
| 2 | Auth: login/register con NextAuth | Paso 1 |
| 3 | CRUD de productos + vista stock | Paso 2 |
| 4 | Tomar pedido (formulario + descuento transaccional) | Paso 3 |
| 5 | Lista de pedidos del día (pendientes/entregados) | Paso 4 |
| 6 | Marcar pedido como Entregado / Anular | Paso 5 |
| 7 | Medios de pago (efectivo + transferencia en cada pedido) | Paso 6 |
| 8 | Dashboard con resumen del día | Pasos 4-7 |
| 9 | Cierre de caja diario | Paso 8 |
| 10 | PWA + deploy a producción | Paso 9 |

---

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Stock inconsistente (2 empleados toman pedido simultáneo) | Alto | Transacciones SQL + bloqueo optimista; v1 minimiza riesgo porque usan 1 teléfono |
| Pérdida de datos si se cierra el navegador | Alto | Turso persiste en servidor; formulario con auto-save en localStorage |
| Conexión a internet inestable en el puesto | Medio | PWA + Service Worker + cache-first para UI; las writes requieren conexión |
| Empleado no técnico no adopta la app | Alto | UX simplest posible: 3 taps para un pedido. Probar con usuario real en semana 1 |
