import { getTodaySummary, closeDay, getCloseHistory } from "@/lib/actions/daily-close";
import { exportDailyCloses } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/export-button";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, History, Lock } from "lucide-react";
import { CloseButton } from "./_components/close-button";

export default async function ClosePage() {
  const [summary, history] = await Promise.all([
    getTodaySummary(),
    getCloseHistory(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cierre de caja</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#30D158]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Ventas</p>
          </div>
          <p className="text-xl font-bold text-white">${summary.salesTotal.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">{summary.salesCount} pedido{summary.salesCount !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF453A]/15 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-[#FF453A]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Compras</p>
          </div>
          <p className="text-xl font-bold text-white">${summary.purchasesTotal.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-[#5E5CE6]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Efectivo</p>
          </div>
          <p className="text-xl font-bold text-white">${summary.cashTotal.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-2 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#FFD60A]" />
            </div>
            <p className="text-xs text-zinc-500 font-medium">Transferencia</p>
          </div>
          <p className="text-xl font-bold text-white">${summary.transferTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 flex items-center justify-center">
              <Lock className="h-4 w-4 text-[#30D158]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ganancia bruta</p>
              <p className="text-xs text-zinc-500">Ventas - Compras</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#30D158]">${summary.grossProfit.toFixed(2)}</p>
        </div>
      </div>

      {summary.isClosed ? (
        <div className="bg-[#30D158]/10 rounded-[28px] p-5 text-center space-y-2 border border-[#30D158]/20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#30D158]/15">
            <Lock className="h-6 w-6 text-[#30D158]" />
          </div>
          <p className="font-semibold text-[#30D158]">Día cerrado</p>
          <p className="text-sm text-zinc-500">
            Cerrado a las{" "}
            {summary.existingClose
              ? new Date(summary.existingClose.closedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
              : ""}
          </p>
        </div>
      ) : (
        <CloseButton disabled={summary.salesCount === 0 && summary.purchasesTotal === 0} />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de cierres
          </h2>
          <ExportButton
            fetchData={exportDailyCloses}
            columns={[
              { key: "date", label: "Fecha" },
              { key: "sales", label: "Ventas" },
              { key: "purchases", label: "Compras" },
              { key: "cash", label: "Efectivo" },
              { key: "transfer", label: "Transferencia" },
              { key: "profit", label: "Ganancia" },
              { key: "orders", label: "Pedidos" },
              { key: "closedAt", label: "Cerrado" },
            ]}
            filename="cierres"
          />
        </div>
        {history.length === 0 ? (
          <div className="bg-zinc-900 rounded-[28px] p-8 text-center border border-zinc-800">
            <p className="text-sm text-zinc-500">No hay cierres anteriores</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
            {history.map((c) => (
              <div key={c.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{c.date}</p>
                  <p className="text-sm font-bold text-[#30D158] font-mono">${c.grossProfit.toFixed(2)}</p>
                </div>
                <div className="flex gap-3 mt-1.5 text-xs text-zinc-500">
                  <span>Ventas: ${c.totalSales.toFixed(2)}</span>
                  <span>Compras: ${c.totalPurchases.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
