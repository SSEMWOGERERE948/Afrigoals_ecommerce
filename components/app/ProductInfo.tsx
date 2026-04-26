"use client";

import { AddToCartButton } from "@/components/app/AddToCartButton";
import { AskAISimilarButton } from "@/components/app/AskAISimilarButton";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/lib/api/types";

function StockIndicator({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Out of Stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
        Only {stock} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      {stock} in stock
    </span>
  );
}

export function ProductInfo({ product }: { product: ApiProduct }) {
  const stock = product.stock ?? 0;
  const mainImageUrl = product.images?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {product.name}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {formatPrice(
              product.price,
              product.currency?.toLowerCase() || "ugx",
            )}
          </p>
          <StockIndicator stock={stock} />
        </div>
      </div>

      {product.description ? (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price ?? 0}
          image={mainImageUrl ?? undefined}
          stock={stock}
        />
        <AskAISimilarButton productName={product.name} />
      </div>
    </div>
  );
}
