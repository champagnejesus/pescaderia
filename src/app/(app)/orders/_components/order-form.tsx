"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";

type Customer = { id: string; name: string; phone: string | null };
type Product = { id: string; name: string; unit: string; salePrice: number };

type Props = {
  products: Product[];
  customers: Customer[];
};

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function OrderForm({ products, customers }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [createNew, setCreateNew] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), productId: "", productName: "", quantity: 0, unitPrice: 0 },
  ]);
  const [cashAmount, setCashAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.phone && c.phone.includes(search)),
      ),
    [customers, search],
  );

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setShowCustomerList(false);
    setSearch(c.name);
    setCreateNew(false);
  }

  function startNewCustomer() {
    setCreateNew(true);
    setSelectedCustomer(null);
    setShowCustomerList(false);
    setClientName(search);
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), productId: "", productName: "", quantity: 0, unitPrice: 0 },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          updated.productName = product?.name ?? "";
          updated.unitPrice = product?.salePrice ?? 0;
        }
        return updated;
      }),
    );
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const paymentDiff = Math.abs(cashAmount + transferAmount - total);
  const paymentOk = paymentDiff < 0.01;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const validItems = items.filter((i) => i.productId && i.quantity > 0);

    if (validItems.length === 0) {
      setError("Agregá al menos un producto con cantidad");
      return;
    }

    if (!paymentOk) {
      setError(
        `El total de pagos ($${(cashAmount + transferAmount).toFixed(2)}) debe ser igual al total del pedido ($${total.toFixed(2)})`,
      );
      return;
    }

    setPending(true);
    const form = new FormData();
    form.set(
      "items",
      JSON.stringify(
        validItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      ),
    );

    if (selectedCustomer) {
      form.set("customerId", selectedCustomer.id);
      form.set("clientName", selectedCustomer.name);
    } else {
      form.set("clientName", clientName);
    }

    form.set("notes", notes);
    form.set("cashAmount", cashAmount.toString());
    form.set("transferAmount", transferAmount.toString());

    const result = await createOrder(form);
    setPending(false);

    if (result.success) {
      toast("success", "Pedido registrado correctamente");
      router.push("/orders");
    } else {
      setError(result.error ?? "Error al crear el pedido");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] font-medium">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-4 border border-zinc-800">
        <h2 className="text-sm font-semibold text-white">Cliente</h2>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowCustomerList(true);
                setSelectedCustomer(null);
              }}
              onFocus={() => setShowCustomerList(true)}
              placeholder="Buscar cliente por nombre o teléfono..."
              className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              disabled={pending}
            />
          </div>
          {showCustomerList && search && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-2xl shadow-lg border border-zinc-700 z-10 max-h-48 overflow-y-auto">
              {filteredCustomers.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.phone && <span className="text-zinc-500 ml-2">{c.phone}</span>}
                </button>
              ))}
              <button
                type="button"
                onClick={startNewCustomer}
                className="w-full text-left px-4 py-2.5 text-sm text-[#5E5CE6] font-medium hover:bg-zinc-700 transition-colors border-t border-zinc-700"
              >
                + Nuevo cliente &quot;{search}&quot;
              </button>
            </div>
          )}
        </div>

        {selectedCustomer && !createNew && (
          <p className="text-sm text-[#30D158] font-medium">✓ {selectedCustomer.name}{selectedCustomer.phone && ` · ${selectedCustomer.phone}`}</p>
        )}

        {createNew && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Nombre *</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="Nombre del cliente"
                disabled={pending}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Teléfono</label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="11 1234-5678"
                disabled={pending}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-xs text-zinc-500">Notas del pedido</label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={pending}
            placeholder="Ej: entregar después de las 17"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Productos</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={pending} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        <div className="divide-y divide-zinc-800">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-end gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex-[2] space-y-1">
                <label className="text-xs text-zinc-500">Producto</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                  disabled={pending}
                  className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors focus-visible:border-[#5E5CE6] focus-visible:ring-3 focus-visible:ring-[#5E5CE6]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.salePrice.toFixed(2)} / {p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="w-20 space-y-1">
                <label className="text-xs text-zinc-500">Cant.</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  disabled={pending}
                  placeholder="0"
                  className="h-10 text-center bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-xs text-zinc-500">Precio</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                  disabled={pending}
                  placeholder="0.00"
                  className="h-10 text-right bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="w-20 space-y-1">
                <label className="text-xs text-zinc-500 text-right block">Subtotal</label>
                <p className="h-10 flex items-center justify-end text-sm font-semibold font-mono text-white px-1">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1 || pending} className="mb-0.5 text-zinc-500 hover:text-zinc-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

          <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <span className="text-sm font-medium text-white">Total</span>
          <span className="text-lg font-bold text-white font-mono">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-4 border border-zinc-800">
        <h2 className="text-sm font-semibold text-white">Pago</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Efectivo ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={cashAmount || ""}
              onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
              disabled={pending}
              placeholder="0.00"
              className="h-11 text-right text-base bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Transferencia ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={transferAmount || ""}
              onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
              disabled={pending}
              placeholder="0.00"
              className="h-11 text-right text-base bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={paymentOk ? "text-[#30D158]" : "text-[#FF453A]"}>
            {paymentOk ? "✓ Pagos coinciden" : `Faltan $${(total - cashAmount - transferAmount).toFixed(2)}`}
          </span>
          <span className={`font-semibold ${paymentOk ? "text-[#30D158]" : "text-[#FF453A]"}`}>
            ${(cashAmount + transferAmount).toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white"
        disabled={pending || !paymentOk}
      >
        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {pending ? "Guardando..." : `Confirmar pedido · $${total.toFixed(2)}`}
      </Button>
    </form>
  );
}
