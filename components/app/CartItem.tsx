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

  return (
    <div
      className={cn(
        "flex gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800",
        hasIssue &&
          "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800",
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

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <Link
            href={item.slug ? `/products/${item.slug}` : "/products"}
            className={cn(
              "line-clamp-2 font-semibold text-foreground hover:text-primary",
              isOutOfStock && "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {item.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-red-500"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove {item.name}</span>
          </Button>
        </div>

        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {formatPrice(item.price)}
        </p>

        {/* Stock Badge & Quantity Controls */}
        <div className="mt-2 flex flex-row justify-between items-center gap-2">
          <StockBadge productId={item.productId} stock={currentStock} />
          {!isOutOfStock && (
            <div className="w-32 flex self-end ml-auto">
              <AddToCartButton
                productId={item.productId}
                slug={item.slug}
                name={item.name}
                price={item.price}
                image={item.image}
                stock={currentStock}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
