import { getProduct, getStockMovements } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const movements = await getStockMovements(id);

  const stockLevel =
    product.stock <= 0 ? "out" : product.stock <= product.minStock ? "low" : "ok";

  const stockConfig = {
    out: { label: "Sin stock", classes: "bg-[#FF453A]/15 text-[#FF453A]" },
    low: { label: "Stock bajo", classes: "bg-[#FFD60A]/15 text-[#FFD60A]" },
    ok: { label: "En stock", classes: "bg-[#30D158]/15 text-[#30D158]" },
  };

  const cfg = stockConfig[stockLevel];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link href="/products" />} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">{product.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href={`/products/${product.id}/edit`} />}>
          <Pencil className="h-4 w-4 mr-1.5" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Precio venta</p>
          <p className="text-xl font-bold text-white">${product.salePrice.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Precio compra</p>
          <p className="text-xl font-bold text-white">${product.costPrice.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Stock actual</p>
          <p className="text-xl font-bold text-white">
            {product.stock}
            <span className="text-sm font-normal text-zinc-500 ml-1">{product.unit}</span>
          </p>
        </div>
        <div className="bg-zinc-900 rounded-[28px] p-4 space-y-1 border border-zinc-800">
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Estado</p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.classes}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {cfg.label}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white tracking-tight mb-3">Movimientos de stock</h2>
        {movements.length === 0 ? (
          <div className="bg-zinc-900 rounded-[28px] p-8 text-center border border-zinc-800">
            <p className="text-sm text-zinc-500">Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 min-w-[80px]">
                    {new Date(m.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                    {m.type === "purchase" ? "Compra" : m.type === "sale" ? "Venta" : m.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono font-bold ${m.quantity > 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                    {m.quantity > 0 ? "+" : ""}{m.quantity}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">→ {m.balanceAfter}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
