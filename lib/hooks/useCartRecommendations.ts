"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/store/cart-store";
import type { FILTER_PRODUCTS_BY_NAME_QUERYResult } from "@/sanity.types";

interface UseCartRecommendationsReturn {
  products: FILTER_PRODUCTS_BY_NAME_QUERYResult;
  isLoading: boolean;
}

export function useCartRecommendations(
  items: CartItem[],
): UseCartRecommendationsReturn {
  const [products, setProducts] = useState<FILTER_PRODUCTS_BY_NAME_QUERYResult>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );

  const fetchRecommendations = useCallback(async () => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: productIds }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cart recommendations: ${response.status}`,
        );
      }

      const nextProducts =
        (await response.json()) as FILTER_PRODUCTS_BY_NAME_QUERYResult;
      setProducts(nextProducts);
    } catch (error) {
      console.error("Failed to fetch cart recommendations:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [productIds]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    products,
    isLoading,
  };
}
