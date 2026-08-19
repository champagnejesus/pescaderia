import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { OrderForm } from "../_components/order-form";

export default async function NewOrderPage() {
  const [products, customers] = await Promise.all([
    getProducts(),
    getCustomers(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo pedido</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Tomá un pedido por teléfono
        </p>
      </div>
      <OrderForm products={products} customers={customers} />
    </div>
  );
}
