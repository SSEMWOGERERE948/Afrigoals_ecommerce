"use client";

import {
  AlertTriangle,
  Loader2,
  LockKeyhole,
  ShoppingBag,
  TicketPercent,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { CartItem } from "@/components/app/CartItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStock } from "@/lib/hooks/useCartStock";
import {
  useCartItems,
  useTotalItems,
  useTotalPrice,
} from "@/lib/store/cart-store-provider";
import { formatPrice } from "@/lib/utils";

export function CartPageClient() {
  const items = useCartItems();
  const totalItems = useTotalItems();
  const subtotal = useTotalPrice();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-gray-400 dark:text-gray-600" />
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Your basket is empty
            </h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Start shopping to add items to your basket.
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Basket
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {totalItems} {totalItems === 1 ? "item" : "items"} ready for
              checkout
              {isLoading && (
                <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
              )}
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-lg border border-primary px-6 py-2 font-semibold text-primary transition hover:bg-primary/5"
          >
            Continue Shopping
          </Link>
        </div>

        {hasStockIssues && !isLoading && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Some basket items have stock issues. Please review before checkout.
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                stockInfo={stockMap.get(item.productId)}
              />
            ))}
          </div>

          <aside>
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Order Summary
              </h2>

              <div className="mb-6 flex gap-2">
                <div className="relative flex-1">
                  <TicketPercent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Coupon code"
                    className="rounded-lg bg-white pl-9 dark:bg-gray-900"
                  />
                </div>
                <Button className="rounded-lg bg-primary hover:bg-primary/90">
                  Apply
                </Button>
              </div>

              <div className="mb-6 space-y-3 border-b border-gray-200 pb-6 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery
                  </span>
                  <span className="font-semibold text-foreground">
                    At checkout
                  </span>
                </div>
              </div>

              <div className="mb-6 flex justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {hasStockIssues ? (
                <Button disabled className="mb-3 w-full rounded-lg py-6">
                  Resolve stock issues to checkout
                </Button>
              ) : (
                <Button
                  asChild
                  className="mb-3 w-full rounded-lg bg-primary py-6 text-lg font-bold hover:bg-primary/90"
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              )}

              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                <p className="flex items-center justify-center gap-2">
                  <LockKeyhole className="h-4 w-4" />
                  Secure payment
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery calculated from your checkout address
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
