"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useCartActions,
  useTotalItems,
  useTotalPrice,
} from "@/lib/store/cart-store-provider";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  hasStockIssues?: boolean;
}

export function CartSummary({ hasStockIssues = false }: CartSummaryProps) {
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-800">
      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Subtotal</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Shipping calculated at checkout
      </p>
      <div className="mt-4">
        {hasStockIssues ? (
          <Button disabled className="w-full rounded-lg">
            Resolve stock issues to checkout
          </Button>
        ) : (
          <Button
            asChild
            className="w-full rounded-lg bg-primary hover:bg-primary/90"
          >
            <Link href="/checkout" onClick={() => closeCart()}>
              Checkout
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-3 text-center">
        <Link
          href="/products"
          className="text-sm text-gray-500 hover:text-primary dark:text-gray-400"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
