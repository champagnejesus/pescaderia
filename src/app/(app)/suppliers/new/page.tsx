import { SupplierForm } from "../_components/supplier-form";
import { createSupplier } from "@/lib/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo proveedor</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Completá los datos del proveedor
        </p>
      </div>
      <SupplierForm action={createSupplier} />
    </div>
  );
}
