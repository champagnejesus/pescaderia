import type { ReactNode } from "react";
import { UserNav } from "@/components/user-nav";
import { StockAlert } from "@/components/stock-alert/stock-alert";
import Link from "next/link";
import { Package, ShoppingCart, Users, Truck, BarChart3, DollarSign, Lock } from "lucide-react";

const navItems = [
  { href: "/products", label: "Productos", icon: Package },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/payments", label: "Pagos", icon: DollarSign },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/close", label: "Cierre", icon: Lock },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center">
      <div className="w-full max-w-[400px] mx-auto min-h-screen relative flex flex-col">
        <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-xl border-b border-zinc-800">
          <div className="flex items-center justify-between h-12 px-5">
            <Link href="/" className="text-base font-semibold text-white tracking-tight">
              Pescadería
            </Link>
            <div className="flex items-center gap-2">
              <StockAlert />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-5 pb-28 overflow-y-auto">
          {children}
        </main>

        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] z-50 bg-[#1c1c1e] rounded-[32px] px-5 py-3 flex justify-between items-center shadow-lg shadow-black/30 border border-zinc-800">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-zinc-500 hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
