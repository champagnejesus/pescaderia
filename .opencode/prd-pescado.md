# PRD: Gestión de Ventas para Pescadería

> **Estado:** Borrador v1  
> **Rol:** office-hours (CEO/PM)  
> **Modo:** Proyecto real — producción  
> **Usuario:** Vendedor de pescados con empleados, ventas al público por teléfono

---

## 1. Elevator Pitch

App móvil (o web mobile-first) que reemplaza el papel, la memoria y los mensajes de WhatsApp para registrar pedidos telefónicos, controlar inventario de pescados y mariscos, y llevar las cuentas del día — efectivo y transferencia — todo desde el celular del vendedor.

---

## 2. El Problema

Hoy el vendedor:
- Anota pedidos en papel o los recibe por WhatsApp
- No sabe al instante si le queda merluza, langostinos, o si ya se vendió todo
- Al final del día tiene que sumar manualmente cuánto vendió y en qué medio
- Los empleados que atienden el teléfono no tienen visibilidad del stock en tiempo real
- Se pierden ventas porque alguien ya comprometió el mismo producto a otro cliente

---

## 3. Usuarios

| Persona | Rol | Necesidad |
|---------|-----|-----------|
| **Dueño** | Vende y supervisa | Visibilidad total del negocio, cierre de caja diario |
| **Empleado** | Atiende teléfono | Registrar pedido rápido, saber stock disponible al instante |

---

## 4. Features — MVP

### 4.1 Productos / Inventario
- CRUD de productos: nombre (Merluza, Langostinos, Calamares...), unidad (kg, unidad, docena), precio por unidad, stock actual
- Stock se descuenta automáticamente al registrar una venta
- Alerta visual cuando stock está bajo (ej. < 5 kg)
- Vista rápida: "¿Tenemos merluza?" → sí, quedan 12 kg

### 4.2 Registro de Ventas (el core)
- Desde el celular: seleccionar producto, ingresar cantidad (kg/unidades), precio final, y medio de pago
- Soporte para varios productos en un mismo pedido
- Timestamp automático
- Posibilidad de anular una venta (devuelve el stock)

### 4.3 Medios de Pago
- Efectivo
- Transferencia (alias o CBU a la vista)
- El cierre del día muestra total por medio

### 4.4 Cierre del Día
- Resumen: total vendido, total efectivo, total transferencia, cantidad de pedidos
- Producto más vendido del día
- Stock final por producto vs stock inicial

### 4.5 Pedidos Telefónicos (alias "el papel")
- Estado del pedido: **Pendiente** (recién tomado), **Entregado** (el cliente ya pasó a retirar), **Anulado**
- El empleado toma el pedido, se descuenta stock automáticamente, queda como Pendiente
- Cuando el cliente llega a buscar, se marca como Entregado

---

## 5. No Haremos (v1)

- ❌ App nativa iOS/Android → PWA o web mobile-first alcanza
- ❌ Pasarela de pagos integrada
- ❌ Notificaciones push
- ❌ Múltiples sucursales
- ❌ Reportes históricos avanzados (viene después)

---

## 6. Stack Sugerido

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (App Router) + Tailwind, mobile-first |
| Backend | Next.js API routes |
| Base de datos | SQLite (mejor: Turso/libSQL para producción barata) o Supabase |
| Auth | Email + contraseña (NextAuth / Supabase Auth) |
| Hosting | Vercel o Railway |
| PWA | next-pwa o @serwist/next |

---

## 7. Flujos Clave

### 7.1 Tomar pedido por teléfono
1. Cliente llama → empleado abre la app
2. Toca "Nuevo pedido"
3. Selecciona productos + cantidades
4. El stock se descuenta en tiempo real
5. Confirma → pedido queda **Pendiente**
6. (Opcional) El empleado anota nombre del cliente o alias para recognición

### 7.2 Consultar stock
- Pantalla principal con cards de cada producto: nombre, stock actual, precio
- Buscador rápido
- Color: verde (OK), amarillo (bajo stock), rojo (sin stock)

### 7.3 Cerrar el día
- Un botón "Cerrar caja" genera el resumen
- Muestra totales y pide confirmar
- Se archiva el día y se resetea el "movimiento del día" (el stock acumula persistentemente)

---

## 8. Criterios de Éxito

1. Un empleado puede registrar un pedido en <30 segundos
2. Stock visible sin navegación — un vistazo alcanza
3. El dueño puede saber cuánto vendió hoy en 5 segundos
4. Cero pérdida de datos — si el celular se apaga, el pedido no se pierde
5. SinWhatsApp — toda la operación vive en la app

---

## 9. Próximos Pasos

1. `/plan-eng-review` — Arquitectura técnica, modelo de datos, diagrama de componentes
2. Setup del proyecto + base de datos
3. CRUD de productos (el ABC del negocio)
4. Registro de ventas (el core)
5. Cierre del día
6. `/review` antes de deploy
7. `/ship` a producción
