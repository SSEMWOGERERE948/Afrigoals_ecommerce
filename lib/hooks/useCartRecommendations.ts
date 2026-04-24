"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CART_RECOMMENDATIONS_QUERY,
  FALLBACK_CART_RECOMMENDATIONS_QUERY,
} from "@/lib/sanity/queries/products";
import type { CartItem } from "@/lib/store/cart-store";
import { client } from "@/sanity/lib/client";
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
      const relatedProducts = (await client.fetch(CART_RECOMMENDATIONS_QUERY, {
        ids: productIds,
      })) as FILTER_PRODUCTS_BY_NAME_QUERYResult;

      if (relatedProducts.length >= 3) {
        setProducts(relatedProducts.slice(0, 3));
        return;
      }

      const excludedIds = [
        ...productIds,
        ...relatedProducts.map((product) => product._id),
      ];

      const fallbackProducts = (await client.fetch(
        FALLBACK_CART_RECOMMENDATIONS_QUERY,
        { ids: excludedIds },
      )) as FILTER_PRODUCTS_BY_NAME_QUERYResult;

      setProducts([...relatedProducts, ...fallbackProducts].slice(0, 3));
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
