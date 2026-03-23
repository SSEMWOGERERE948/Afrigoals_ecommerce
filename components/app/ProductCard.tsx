"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import type { FILTER_PRODUCTS_BY_NAME_QUERYResult } from "@/sanity.types";

type Product = FILTER_PRODUCTS_BY_NAME_QUERYResult[number];

interface ProductCardProps {
  product: Product;
}

function getDiscountPercent(price: number, compareAtPrice?: number | null) {
  if (
    typeof compareAtPrice !== "number" ||
    compareAtPrice <= 0 ||
    compareAtPrice <= price
  ) {
    return null;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(
    null
  );

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;
  const displayedImageUrl =
    hoveredImageIndex !== null
      ? images[hoveredImageIndex]?.asset?.url
      : mainImageUrl;

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const hasMultipleImages = images.length > 1;

  const price = product.price ?? 0;

  const compareAtPrice =
    "compareAtPrice" in product
      ? (product.compareAtPrice as number | null | undefined)
      : undefined;

  const soldCount =
    "soldCount" in product
      ? (product.soldCount as number | null | undefined)
      : undefined;

  const discountPercent = getDiscountPercent(price, compareAtPrice);

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10 dark:hover:shadow-zinc-950/50">
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900",
            hasMultipleImages ? "aspect-square" : "aspect-[4/5]"
          )}
        >
          {displayedImageUrl ? (
            <Image
              src={displayedImageUrl}
              alt={product.name ?? "Product image"}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <svg
                className="h-16 w-16 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {discountPercent !== null && (
            <span className="absolute right-0 top-3 rounded-l-md bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
              -{discountPercent}%
            </span>
          )}

          {isOutOfStock ? (
            <Badge
              variant="destructive"
              className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-medium shadow-lg"
            >
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm dark:bg-orange-900/40 dark:text-orange-300">
              Only {stock} left
            </span>
          ) : null}

          {product.category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300">
              {product.category.title}
            </span>
          )}
        </div>
      </Link>

      {hasMultipleImages && (
        <div className="flex gap-2 border-t border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          {images.map((image, index) => (
            <button
              key={image._key ?? index}
              type="button"
              className={cn(
                "relative h-14 flex-1 overflow-hidden rounded-lg transition-all duration-200",
                hoveredImageIndex === index
                  ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900"
                  : "opacity-50 hover:opacity-100"
              )}
              onMouseEnter={() => setHoveredImageIndex(index)}
              onMouseLeave={() => setHoveredImageIndex(null)}
            >
              {image.asset?.url && (
                <Image
                  src={image.asset.url}
                  alt={`${product.name} - view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <CardContent className="flex grow flex-col justify-between gap-2 p-5">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            {product.name}
          </h3>
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {formatPrice(price)}
            </p>

            {discountPercent !== null && compareAtPrice != null && (
              <p className="text-sm text-zinc-400 line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
          </div>

          {discountPercent !== null && compareAtPrice != null && (
            <p className="text-xs font-medium text-green-600 dark:text-green-400">
              Customer saves {formatPrice(compareAtPrice - price)}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <StockBadge productId={product._id} stock={stock} />
            {typeof soldCount === "number" && soldCount > 0 && (
              <span className="text-xs text-zinc-500">{soldCount} sold</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto p-5 pt-0">
        <AddToCartButton
          productId={product._id}
          name={product.name ?? "Unknown Product"}
          price={product.price ?? 0}
          image={mainImageUrl ?? undefined}
          stock={stock}
        />
      </CardFooter>
    </Card>
  );
}
