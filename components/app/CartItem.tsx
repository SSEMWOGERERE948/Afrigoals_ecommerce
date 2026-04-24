"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import { Button } from "@/components/ui/button";
import type { StockInfo } from "@/lib/hooks/useCartStock";
import type { CartItem as CartItemType } from "@/lib/store/cart-store";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { cn, formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
  stockInfo?: StockInfo;
}

export function CartItem({ item, stockInfo }: CartItemProps) {
  const { removeItem } = useCartActions();

  const isOutOfStock = stockInfo?.isOutOfStock ?? false;
  const exceedsStock = stockInfo?.exceedsStock ?? false;
  const currentStock = stockInfo?.currentStock ?? 999;
  const hasIssue = isOutOfStock || exceedsStock;
  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row dark:border-gray-700 dark:bg-gray-800",
        hasIssue &&
          "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
      )}
    >
      <div
        className={cn(
          "relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-28 dark:bg-zinc-800",
          isOutOfStock && "opacity-50",
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={item.slug ? `/products/${item.slug}` : "/products"}
              className={cn(
                "line-clamp-2 text-base font-semibold text-foreground transition hover:text-primary",
                isOutOfStock && "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ready for checkout
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-500"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove {item.name}</span>
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Unit price
              </p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPrice(item.price)}
              </p>
            </div>
            <StockBadge productId={item.productId} stock={currentStock} />
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Line total{" "}
              <span className="ml-2 text-lg font-bold text-foreground">
                {formatPrice(lineTotal)}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="w-full sm:w-36">
                <AddToCartButton
                  productId={item.productId}
                  slug={item.slug}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  stock={currentStock}
                  className="h-10"
                  redirectToCartOnAdd={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
