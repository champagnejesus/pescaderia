import { getPurchases } from "@/lib/actions/purchases";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Compras</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {purchases.length} compra{purchases.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="pill" className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" render={<Link href="/purchases/new" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva
        </Button>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <Truck className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay compras todavía</p>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href="/purchases/new" />}>
            Registrar primera compra
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="bg-zinc-900 rounded-[28px] p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] text-white">
                    {p.invoice ?? "Compra"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </p>
                </div>
                <p className="text-lg font-bold text-white font-mono">${p.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
