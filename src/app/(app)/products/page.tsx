import { getProducts, deleteProduct } from "@/lib/actions/products";
import { exportProducts } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/export-button";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

function stockLevel(stock: number, minStock: number) {
  if (stock <= 0) return "out";
  if (stock <= minStock) return "low";
  return "ok";
}

const stockConfig = {
  out: { label: "Sin stock", classes: "bg-[#FF453A]/15 text-[#FF453A]" },
  low: { label: "Stock bajo", classes: "bg-[#FFD60A]/15 text-[#FFD60A]" },
  ok: { label: "En stock", classes: "bg-[#30D158]/15 text-[#30D158]" },
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Productos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            fetchData={exportProducts}
            columns={[
              { key: "name", label: "Nombre" },
              { key: "unit", label: "Unidad" },
              { key: "stock", label: "Stock" },
              { key: "minStock", label: "Stock Mín." },
              { key: "salePrice", label: "Precio Venta" },
              { key: "costPrice", label: "Precio Costo" },
              { key: "createdAt", label: "Creado" },
            ]}
            filename="productos"
          />
          <Button size="pill" className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" render={<Link href="/products/new" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <Package className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay productos todavía</p>
          <Button variant="outline" render={<Link href="/products/new" />}>
            Crear primer producto
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const level = stockLevel(p.stock, p.minStock);
            const cfg = stockConfig[level];
            return (
              <div
                key={p.id}
                className="bg-zinc-900 rounded-[28px] p-4 border border-zinc-800 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between">
                  <Link href={`/products/${p.id}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-white">{p.name}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      ${p.salePrice.toFixed(2)} / {p.unit}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{p.stock}</p>
                      <p className="text-[11px] text-zinc-500">{p.unit}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    render={<Link href={`/products/${p.id}/edit`} />}
                  >
                    Editar
                  </Button>
                  <form action={deleteProduct.bind(null, p.id)} className="flex-1">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Eliminar
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
