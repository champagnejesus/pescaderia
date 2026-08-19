import { getCustomers, deleteCustomer } from "@/lib/actions/customers";
import { exportCustomers } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/export-button";
import Link from "next/link";
import { Plus, Users, Phone, MapPin } from "lucide-react";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {customers.length} cliente{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            fetchData={exportCustomers}
            columns={[
              { key: "name", label: "Nombre" },
              { key: "phone", label: "Teléfono" },
              { key: "address", label: "Dirección" },
              { key: "notes", label: "Notas" },
              { key: "createdAt", label: "Creado" },
            ]}
            filename="clientes"
          />
          <Button size="pill" className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" render={<Link href="/customers/new" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <Users className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay clientes todavía</p>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href="/customers/new" />}>
            Crear primer cliente
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div key={c.id} className="bg-zinc-900 rounded-[28px] border border-zinc-800 active:scale-[0.99] transition-all overflow-hidden">
              <Link href={`/customers/${c.id}`} className="block p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-white">{c.name}</p>
                    {c.phone && (
                      <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </p>
                    )}
                    {c.address && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.address}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 px-4 pb-4">
                <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href={`/customers/${c.id}/edit`} />}>
                  Editar
                </Button>
                <form action={deleteCustomer.bind(null, c.id) as unknown as (formData: FormData) => void} className="flex-1">
                  <Button type="submit" variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Eliminar
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
