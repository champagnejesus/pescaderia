# PRD: Origin Finance — App Financiera Personal (Demo)

> **Estado:** Borrador v1  
> **Rol:** office-hours (CEO/PM)  
> **Modo:** Full demo-mode — datos mock, sin wiring bancario real  
> **Propósito:** Portfolio personal que demuestre frontend, backend, arquitectura y diseño de producto

---

## 1. Elevator Pitch

Una app financiera personal tipo Origin — dashboard patrimonial, transacciones, presupuestos, metas de ahorro e inversiones mock — que corre 100% en demo con datos generados. Muestra que sé diseñar sistemas complejos, construir UIs financieras y contar una historia de producto cohesiva.

---

## 2. Alcance — MVP (6 features)

| Feature | Descripción | Mock Data |
|---------|-------------|-----------|
| **Dashboard patrimonial** | Net worth, cuentas conectadas, gráfico de evolución temporal | 3-5 cuentas (cheques, ahorro, inversión), transacciones generadas con reglas |
| **Transacciones** | Lista infinita, filtros (fecha, categoría, cuenta), búsqueda, categorización automática | 200+ transacciones con timestamps realistas, categorías, montos |
| **Presupuestos** | Límites mensuales por categoría, barra de progreso, alertas visuales | Budgets pre-seteados para 6 categorías, consumo simulado |
| **Metas / Goals** | Meta con nombre, target $, barra "$X / $Y", fecha estimada | 3 metas en progreso, 1 completada, 1 fallida |
| **Inversiones** | Portafolio mock, rentabilidad YTD, asset allocation (gráfico torta), lista de holdings | 6-8 holdings con precios históricos simulados |
| **Autenticación** | Login/register con email+contraseña, sesión persistente, ruteo protegido | Auth0 o Firebase Auth, sin lógica real de usuarios |

---

## 3. Arquitectura Técnica (Propuesta)

```
Frontend (React / Next.js)
  ├── /app (App Router)
  │   ├── /dashboard        → Patrimonial net worth + gráficos
  │   ├── /transactions     → Lista + filtros + búsqueda
  │   ├── /budgets          → Presupuestos + progreso
  │   ├── /goals            → Metas de ahorro
  │   ├── /investments      → Portafolio + allocation
  │   └── /auth             → Login / register
  ├── /lib
  │   ├── mock-data         → Generadores de datos sintéticos
  │   ├── stores            → Estado global (Zustand / Context)
  │   └── utils             → Currency, dates, formatters
  └── /components/ui        → Design system propio

Backend (opcional — Next.js API routes o Express)
  ├── /api/auth             → Auth0 / Firebase Auth handler
  ├── /api/mock/*           → Endpoints que sirven mock data
  └── /api/transactions     → CRUD de transacciones (en memoria o SQLite)
```

**Stack sugerido:**
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Recharts (gráficos)
- **Estado:** Zustand o React Context
- **Auth:** Auth0 (free tier) o Firebase Auth
- **Backend:** Next.js API routes (simplica deploy)
- **Mock data:** Faker.js + generadores custom con seeds determinísticos
- **Deploy:** Vercel (gratuito)

---

## 4. Flujos de Usuario (Core)

### 4.1 Onboarding
1. Usuario llega a `/` → ve landing page con demo preview
2. Click "Comenzar demo" → login con email+contraseña
3. Post-auth → redirect a `/dashboard` con datos pre-cargados

### 4.2 Dashboard
- Net worth en grande (arriba)
- Gráfico de evolución (7d, 30d, 1y, ALL)
- Tarjetas de resumen: ingresos del mes, gastos, inversiones
- Timeline de transacciones recientes (últimas 5)

### 4.3 Transacciones
- Tabla virtualizada con scroll infinito
- Filtros: período, categoría, cuenta, monto mínimo/máximo, texto libre
- Categorías con color + ícono
- Click para ver detalle en modal

### 4.4 Presupuestos
- Grid de categorías con barra de progreso circular o lineal
- Verde si < 70%, amarillo 70-90%, rojo > 90%
- Sidebar con detalle: gastado vs restante, días restantes en el mes

### 4.5 Metas
- Cada meta muestra: nombre, ícono, $current/$target, %, fecha estimada
- Barra de progreso con "on track" / "behind" / "at risk"
- Meta completada: check + confetti

### 4.6 Inversiones
- Total portafolio + rentabilidad (+X.XX%)
- Asset allocation: gráfico de torta (acciones, bonos, ETF, crypto, efectivo)
- Tabla de holdings: símbolo, nombre, cantidad, precio, valor total, % del portafolio, ganancia/pérdida

---

## 5. Mock Data — Estrategia

No queremos datos estáticos. Usar **generadores determinísticos**:

```typescript
const seed = "origin-demo-seed-2026";
const faker = new Faker({ locale: es, seed });

// Output consistente en cada build
const accounts = generateAccounts(seed);          // 4 cuentas
const transactions = generateTransactions(seed);  // ~250 transacciones
const budgetGoals = generateBudgets(seed);         // 6 categorías
// etc.
```

Esto da la ilusión de datos reales sin exponer información sensible. Cada deploy genera el mismo set.

---

## 6. No Haremos (out of scope)

- ❌ Conexión bancaria real (Plaid, Finverse, Belvo)
- ❌ OCR de comprobantes / escaneo de facturas
- ❌ Pagos / transferencias reales
- ❌ Multi-tenancy o usuarios reales
- ❌ Mobile apps nativas (responsive web alcanza)
- ❌ Reglas de categorización ML (categorización mock por palabras clave)
- ❌ Notificaciones push / email reales

---

## 7. Criterios de Éxito para Portfolio

1. **Cohesión visual** — La app se ve y siente como un producto real, no un template
2. **Estados cubiertos** — Loading, empty, error, success en cada pantalla
3. **Rendimiento** — Listas virtualizadas, datos precargados, sin re-renders tontos
4. **Código limpio** — Componentes atómicos, types compartidos, mocks separados de UI
5. **README impecable** — Tech stack, setup instructions, arquitectura, decisiones de diseño
6. **Deploy en Vercel** — Live URL en el portfolio

---

## 8. Próximos Pasos (después de este PRD)

1. `/plan-eng-review` — Review de arquitectura técnica y diagrama de componentes
2. Setup del proyecto Next.js + Tailwind + estructura de directorios
3. Implementación feature por feature (empezar por dashboard + auth)
4. `/review` — Code review del diff pre-ship
5. `/ship` — PR + deploy a producción
