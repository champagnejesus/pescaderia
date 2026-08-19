import { CustomerForm } from "../_components/customer-form";
import { createCustomer } from "@/lib/actions/customers";

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo cliente</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Completá los datos del cliente
        </p>
      </div>
      <CustomerForm action={createCustomer} />
    </div>
  );
}
