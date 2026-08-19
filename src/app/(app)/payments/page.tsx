import { getPayments, getPaymentsSummary } from "@/lib/actions/payments";
import { exportPayments } from "@/lib/actions/export";
import { ExportButton } from "@/components/export/export-button";
import { DollarSign, CreditCard, ArrowDownUp } from "lucide-react";

const methodConfig = {
  cash: { label: "Efectivo", icon: DollarSign, classes: "bg-[#30D158]/15 text-[#30D158]" },
  transfer: { label: "Transferencia", icon: CreditCard, classes: "bg-[#5E5CE6]/15 text-[#5E5CE6]" },
};

export default async function PaymentsPage() {
  const [allPayments, summary] = await Promise.all([
    getPayments(),
    getPaymentsSummary(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pagos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {allPayments.length} pago{allPayments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ExportButton
          fetchData={exportPayments}
          columns={[
            { key: "order", label: "Pedido" },
            { key: "method", label: "Método" },
            { key: "amount", label: "Monto" },
            { key: "reference", label: "Referencia" },
            { key: "date", label: "Fecha" },
          ]}
          filename="pagos"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium">Total</p>
          <p className="text-xl font-bold text-white">${summary.total.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium">Efectivo</p>
          <p className="text-lg font-bold text-[#30D158]">${summary.cash.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">{summary.cashCount} pago{summary.cashCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium">Transferencia</p>
          <p className="text-lg font-bold text-[#5E5CE6]">${summary.transfer.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">{summary.transferCount} pago{summary.transferCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {allPayments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <ArrowDownUp className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay pagos registrados todavía</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
          {allPayments.map((p) => {
            const cfg = methodConfig[p.method as keyof typeof methodConfig] ?? methodConfig.cash;
            const Icon = cfg.icon;
            return (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl ${cfg.classes} flex items-center justify-center`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.clientName ?? "Cliente"}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white font-mono">${p.amount.toFixed(2)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
