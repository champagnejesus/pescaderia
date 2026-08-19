import { getSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { notFound } from "next/navigation";
import { SupplierForm } from "../../_components/supplier-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  async function editAction(prev: unknown, formData: FormData) {
    "use server";
    formData.set("id", supplier.id);
    return updateSupplier(prev, formData);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Editar proveedor</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {supplier.name}
        </p>
      </div>
      <SupplierForm
        action={editAction}
        defaultValues={{
          name: supplier.name,
          contact: supplier.contact,
          phone: supplier.phone,
          notes: supplier.notes,
        }}
      />
    </div>
  );
}
