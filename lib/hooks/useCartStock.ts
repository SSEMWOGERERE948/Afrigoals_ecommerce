"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/store/cart-store";
import type { CatalogProduct } from "@/lib/catalog/types";

export interface StockInfo {
  productId: string;
  currentStock: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableQuantity: number;
}

export type StockMap = Map<string, StockInfo>;

interface UseCartStockReturn {
  stockMap: StockMap;
  isLoading: boolean;
  hasStockIssues: boolean;
  refetch: () => void;
}

/**
 * Fetches current stock levels for cart items
 * Returns stock info map and loading state
 */
export function useCartStock(items: CartItem[]): UseCartStockReturn {
  const [stockMap, setStockMap] = useState<StockMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Memoize product IDs to use as stable dependency
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );

  const fetchStock = useCallback(async () => {
    if (items.length === 0) {
      setStockMap(new Map());
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: productIds }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stock: ${response.status}`);
      }

      const products = (await response.json()) as CatalogProduct[];

      const newStockMap = new Map<string, StockInfo>();

      for (const item of items) {
        const product = products.find(
          (p: { _id: string }) => p._id === item.productId,
        );
        const currentStock = product?.stock ?? 0;

        newStockMap.set(item.productId, {
          productId: item.productId,
          currentStock,
          isOutOfStock: currentStock === 0,
          exceedsStock: item.quantity > currentStock,
          availableQuantity: Math.min(item.quantity, currentStock),
        });
      }

      setStockMap(newStockMap);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  }, [items, productIds]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock,
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch: fetchStock,
  };
}
