import { getCustomer, updateCustomer } from "@/lib/actions/customers";
import { notFound } from "next/navigation";
import { CustomerForm } from "../../_components/customer-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  async function editAction(prev: unknown, formData: FormData) {
    "use server";
    formData.set("id", customer.id);
    return updateCustomer(prev, formData);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Editar cliente</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {customer.name}
        </p>
      </div>
      <CustomerForm
        action={editAction}
        defaultValues={{
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes,
        }}
      />
    </div>
  );
}
