import { ProductForm } from "../_components/product-form";
import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo producto</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Completá los datos del producto
        </p>
      </div>
      <ProductForm action={createProduct} />
    </div>
  );
}
