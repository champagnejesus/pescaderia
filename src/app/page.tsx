import Link from "next/link";
import { Package, ShoppingCart, Truck, BarChart3, DollarSign, Lock } from "lucide-react";

const quickLinks = [
  { href: "/products/new", label: "Nuevo producto", icon: Package, desc: "Agregar un producto al stock" },
  { href: "/orders/new", label: "Nuevo pedido", icon: ShoppingCart, desc: "Registrar una venta" },
  { href: "/purchases/new", label: "Nueva compra", icon: Truck, desc: "Ingresar mercadería" },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, desc: "Resumen del día" },
  { href: "/close", label: "Cierre de caja", icon: Lock, desc: "Cerrar el día" },
];

const modules = [
  { href: "/products", label: "Productos", icon: Package, desc: "Stock, precios y movimientos" },
  { href: "/customers", label: "Clientes", icon: DollarSign, desc: "Historial y contacto" },
  { href: "/suppliers", label: "Proveedores", icon: Truck, desc: "Compras y contactos" },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart, desc: "Ventas y estados" },
  { href: "/payments", label: "Pagos", icon: DollarSign, desc: "Efectivo y transferencias" },
  { href: "/close", label: "Cierre", icon: Lock, desc: "Cerrar caja del día" },
];

export default function Home() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Inicio</h1>
        <p className="text-sm text-zinc-500 mt-0.5">¿Qué querés hacer hoy?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-zinc-900 rounded-[28px] p-4 space-y-3 border border-zinc-800 active:scale-[0.97] transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <link.icon className="h-5 w-5 text-[#5E5CE6]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{link.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold text-white tracking-tight mb-3">Módulos</h2>
        <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex items-center gap-3 px-5 py-3.5 active:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                <mod.icon className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{mod.label}</p>
                <p className="text-xs text-zinc-500">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
