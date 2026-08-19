import { getSuppliers, deleteSupplier } from "@/lib/actions/suppliers";
import { exportSuppliers } from "@/lib/actions/export";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/export/export-button";
import Link from "next/link";
import { Plus, Truck, Phone, User as UserIcon } from "lucide-react";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Proveedores</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {suppliers.length} proveedor{suppliers.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            fetchData={exportSuppliers}
            columns={[
              { key: "name", label: "Nombre" },
              { key: "contact", label: "Contacto" },
              { key: "phone", label: "Teléfono" },
              { key: "notes", label: "Notas" },
              { key: "createdAt", label: "Creado" },
            ]}
            filename="proveedores"
          />
          <Button size="pill" className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" render={<Link href="/suppliers/new" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-[28px] bg-zinc-800 flex items-center justify-center">
            <Truck className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">No hay proveedores todavía</p>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href="/suppliers/new" />}>
            Crear primer proveedor
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-zinc-900 rounded-[28px] border border-zinc-800 active:scale-[0.99] transition-all overflow-hidden">
              <Link href={`/suppliers/${s.id}`} className="block p-4">
                <p className="font-semibold text-[15px] text-white">{s.name}</p>
                {(s.contact || s.phone) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    {s.contact && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {s.contact}
                      </p>
                    )}
                    {s.phone && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {s.phone}
                      </p>
                    )}
                  </div>
                )}
              </Link>
              <div className="flex gap-2 px-4 pb-4">
                <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" render={<Link href={`/suppliers/${s.id}/edit`} />}>
                  Editar
                </Button>
                <form action={deleteSupplier.bind(null, s.id) as unknown as (formData: FormData) => void} className="flex-1">
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
