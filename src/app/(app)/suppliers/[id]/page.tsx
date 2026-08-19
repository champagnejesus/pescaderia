import { getSupplier, getSupplierPurchases } from "@/lib/actions/suppliers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, User as UserIcon, ShoppingCart } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  const purchases = await getSupplierPurchases(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link href="/suppliers" />} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">{supplier.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href={`/suppliers/${supplier.id}/edit`} />}>
          <Pencil className="h-4 w-4 mr-1.5" /> Editar
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <h2 className="text-xs font-medium text-zinc-500 tracking-wide uppercase">Información</h2>
        {supplier.contact && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-[#5E5CE6]" />
            </div>
            <p className="text-sm text-white">{supplier.contact}</p>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <Phone className="h-4 w-4 text-[#5E5CE6]" />
            </div>
            <p className="text-sm text-white">{supplier.phone}</p>
          </div>
        )}
        {!supplier.contact && !supplier.phone && (
          <p className="text-sm text-zinc-500">Sin información adicional</p>
        )}
      </div>

      {supplier.notes && (
        <div className="bg-zinc-900 rounded-[28px] p-5 space-y-2 border border-zinc-800">
          <h2 className="text-xs font-medium text-zinc-500 tracking-wide uppercase">Notas</h2>
          <p className="text-sm text-white whitespace-pre-wrap">{supplier.notes}</p>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-white tracking-tight mb-3">Compras ({purchases.length})</h2>
        {purchases.length === 0 ? (
          <div className="bg-zinc-900 rounded-[28px] p-8 text-center border border-zinc-800">
            <p className="text-sm text-zinc-500">No se registraron compras a este proveedor</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {new Date(p.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long" })}
                    </p>
                    {p.invoice && <p className="text-xs text-zinc-500">Factura: {p.invoice}</p>}
                  </div>
                </div>
                <p className="text-sm font-bold text-white font-mono">${p.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
