import { getSuppliers } from "@/lib/actions/suppliers";
import { getProducts } from "@/lib/actions/products";
import { PurchaseForm } from "../_components/purchase-form";

export default async function NewPurchasePage() {
  const [suppliers, products] = await Promise.all([
    getSuppliers(),
    getProducts(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nueva compra</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Registrá la mercadería que ingresa
        </p>
      </div>
      <PurchaseForm suppliers={suppliers} products={products} />
    </div>
  );
}
