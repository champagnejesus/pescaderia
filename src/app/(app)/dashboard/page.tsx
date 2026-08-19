import { getDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Clock,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-[#5E5CE6]/20 text-[#5E5CE6]" },
  delivered: { label: "Entregado", classes: "bg-[#30D158]/20 text-[#30D158]" },
  cancelled: { label: "Anulado", classes: "bg-[#FF453A]/20 text-[#FF453A]" },
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {new Date().toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-[28px] p-5 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#30D158]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Ventas</p>
          </div>
          <p className="text-3xl font-bold text-white">${data.salesTotal.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">{data.salesCount} pedido{data.salesCount !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-zinc-900 rounded-[28px] p-5 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF453A]/15 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-[#FF453A]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Compras</p>
          </div>
          <p className="text-3xl font-bold text-white">${data.purchasesTotal.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">{data.purchasesCount} compra{data.purchasesCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-[#5E5CE6]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Efectivo</p>
          </div>
          <p className="text-xl font-bold text-white">${data.cashTotal.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5 text-[#FFD60A]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Transferencia</p>
          </div>
          <p className="text-xl font-bold text-white">${data.transferTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/orders?status=pending"
          className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800 active:scale-[0.97] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-[#FFD60A]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Pendientes</p>
          </div>
          <p className="text-2xl font-bold text-white">{data.pendingCount}</p>
        </Link>

        <Link
          href="/products"
          className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800 active:scale-[0.97] transition-all"
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${data.lowStockCount > 0 ? "bg-[#FF453A]/15" : "bg-[#30D158]/15"}`}>
              <AlertTriangle className={`h-3.5 w-3.5 ${data.lowStockCount > 0 ? "text-[#FF453A]" : "text-[#30D158]"}`} />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Stock bajo</p>
          </div>
          <p className={`text-2xl font-bold ${data.lowStockCount > 0 ? "text-[#FF453A]" : "text-[#30D158]"}`}>{data.lowStockCount}</p>
        </Link>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Ganancia bruta del día</h2>
          <span className="text-2xl font-bold text-[#30D158]">${data.grossProfit.toFixed(2)}</span>
        </div>
        <p className="text-xs text-zinc-500">
          Ventas (${data.salesTotal.toFixed(2)}) - Compras (${data.purchasesTotal.toFixed(2)})
        </p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white tracking-tight mb-3">Últimos pedidos</h2>
        {data.recentOrders.length === 0 ? (
          <div className="bg-zinc-900 rounded-[28px] p-8 text-center border border-zinc-800">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-zinc-500" />
              </div>
            </div>
            <p className="text-sm text-zinc-500">No hay pedidos hoy</p>
            <Button variant="outline" size="sm" className="mt-3" render={<Link href="/orders/new" />}>
              Tomar primer pedido
            </Button>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
            {data.recentOrders.map((o) => {
              const cfg = statusConfig[o.status] ?? statusConfig.pending;
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white">{o.clientName ?? "Cliente"}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(o.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                    <p className="text-sm font-bold text-white font-mono">${o.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
