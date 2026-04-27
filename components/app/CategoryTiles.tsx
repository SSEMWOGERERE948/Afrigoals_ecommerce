"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogCategory } from "@/lib/catalog/types";

interface CategoryTilesProps {
  categories: CatalogCategory[];
  activeCategory?: string;
}

export function CategoryTiles({
  categories,
  activeCategory,
}: CategoryTilesProps) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-3 gap-3 py-4 sm:grid-cols-4 lg:grid-cols-7">
        <Link
          href="/products"
          className={`group flex min-h-28 flex-col items-center justify-center rounded-lg border p-4 text-center transition-all ${
            !activeCategory
              ? "border-primary bg-primary/5"
              : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-primary/10"
          }`}
        >
          <span className="mb-2 text-3xl">🛍️</span>
          <span className="text-xs font-semibold text-foreground sm:text-sm">
            All Products
          </span>
        </Link>

        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          const imageUrl = category.imageUrl;

          return (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className={`group flex min-h-28 flex-col items-center justify-center rounded-lg border p-4 text-center transition-all ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-primary/10"
              }`}
            >
              <span className="relative mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl dark:bg-gray-700">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={category.title ?? "Category"}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="48px"
                  />
                ) : (
                  "🏅"
                )}
              </span>
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {category.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
