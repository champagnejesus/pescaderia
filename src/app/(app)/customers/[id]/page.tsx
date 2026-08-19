import { getCustomer, getCustomerOrders } from "@/lib/actions/customers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, MapPin, FileText } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const orders = await getCustomerOrders(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link href="/customers" />} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">{customer.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href={`/customers/${customer.id}/edit`} />}>
          <Pencil className="h-4 w-4 mr-1.5" /> Editar
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <h2 className="text-xs font-medium text-zinc-500 tracking-wide uppercase">Información de contacto</h2>
        {customer.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <Phone className="h-4 w-4 text-[#5E5CE6]" />
            </div>
            <p className="text-sm text-white">{customer.phone}</p>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5E5CE6]/15 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-[#5E5CE6]" />
            </div>
            <p className="text-sm text-white">{customer.address}</p>
          </div>
        )}
        {!customer.phone && !customer.address && (
          <p className="text-sm text-zinc-500">Sin información de contacto</p>
        )}
      </div>

      {customer.notes && (
        <div className="bg-zinc-900 rounded-[28px] p-5 space-y-2 border border-zinc-800">
          <h2 className="text-xs font-medium text-zinc-500 tracking-wide uppercase">Notas</h2>
          <p className="text-sm text-white whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-white tracking-tight mb-3">Pedidos ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="bg-zinc-900 rounded-[28px] p-8 text-center border border-zinc-800">
            <p className="text-sm text-zinc-500">Este cliente no tiene pedidos todavía</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[28px] divide-y divide-zinc-800 overflow-hidden border border-zinc-800">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {new Date(o.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long" })}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">{o.status}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white font-mono">${o.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
