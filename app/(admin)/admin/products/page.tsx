"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/lib/auth/client";
import type { ApiProduct } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";
import { ProductUpsertDialog } from "@/components/admin/ProductUpsertDialog";

export default function AdminProductsPage() {
  const { status, user } = useAuthState();
  const isAdmin = user?.role === "admin";
  const canUseAdmin = status !== "loading" && isAdmin;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertMode, setUpsertMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ApiProduct | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data as any)?.error || `Failed to load products (${res.status})`,
        );
        setProducts([]);
        return;
      }
      setProducts(data as ApiProduct[]);
    } catch {
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canUseAdmin) {
      loadProducts();
      return;
    }
    setLoading(false);
  }, [canUseAdmin]);

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    setError(null);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as any)?.error || "Failed to delete product");
      return;
    }
    await loadProducts();
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-red-600 dark:text-red-400">Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create and edit store products.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadProducts} disabled={loading}>
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSelected(null);
              setUpsertMode("create");
              setUpsertOpen(true);
            }}
          >
            New product
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-4 text-zinc-500 dark:text-zinc-400"
                    colSpan={4}
                  >
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-4 text-zinc-500 dark:text-zinc-400"
                    colSpan={4}
                  >
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-zinc-100 dark:border-zinc-900"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-zinc-100 dark:bg-zinc-900">
                          {p.images?.[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {p.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(p.price, p.currency)}
                    </td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(p);
                            setUpsertMode("edit");
                            setUpsertOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductUpsertDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        mode={upsertMode}
        product={selected}
        onSaved={loadProducts}
      />
    </div>
  );
}
