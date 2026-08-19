import { getOrders, updateOrderStatus, cancelOrder } from "@/lib/actions/orders";
import { exportOrders } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/export-button";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-[#5E5CE6]/20 text-[#5E5CE6]" },
  delivered: { label: "Entregado", classes: "bg-[#30D158]/20 text-[#30D158]" },
  cancelled: { label: "Anulado", classes: "bg-[#FF453A]/20 text-[#FF453A]" },
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pedidos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            fetchData={exportOrders}
            columns={[
              { key: "id", label: "ID" },
              { key: "client", label: "Cliente" },
              { key: "status", label: "Estado" },
              { key: "total", label: "Total" },
              { key: "date", label: "Fecha" },
            ]}
            filename="pedidos"
          />
          <Button size="pill" className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" render={<Link href="/orders/new" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay pedidos todavía</p>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href="/orders/new" />}>
            Tomar primer pedido
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const cfg = statusConfig[o.status] ?? statusConfig.pending;
            return (
              <div key={o.id} className="bg-zinc-900 rounded-[28px] p-4 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-white">{o.clientName ?? "Cliente"}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                    <p className="text-lg font-bold text-white font-mono">${o.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                  {o.status === "pending" && (
                    <>
                      <form action={updateOrderStatus.bind(null, o.id, "delivered")} className="flex-1">
                        <Button type="submit" size="sm" className="w-full bg-[#30D158] hover:bg-[#30D158]/80 text-white">
                          Entregar
                        </Button>
                      </form>
                      <form action={cancelOrder.bind(null, o.id)} className="flex-1">
                        <Button type="submit" variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                          Anular
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
