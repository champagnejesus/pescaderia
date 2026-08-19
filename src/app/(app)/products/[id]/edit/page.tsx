import { getProduct, updateProduct } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import { ProductForm } from "../../_components/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  async function editAction(prev: unknown, formData: FormData) {
    "use server";
    formData.set("id", product.id);
    return updateProduct(prev, formData);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Editar producto</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {product.name}
        </p>
      </div>
      <ProductForm
        action={editAction}
        defaultValues={{
          name: product.name,
          unit: product.unit as "kg" | "unidad" | "docena",
          salePrice: product.salePrice,
          costPrice: product.costPrice,
          minStock: product.minStock,
        }}
      />
    </div>
  );
}
