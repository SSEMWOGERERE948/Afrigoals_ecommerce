"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog/types";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface ProductSectionProps {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  searchQuery: string;
}

export function ProductSection({
  categories,
  products,
  searchQuery,
}: ProductSectionProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
          {searchQuery && (
            <span>
              {" "}
              for &quot;<span className="font-medium">{searchQuery}</span>&quot;
            </span>
          )}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 rounded-lg border-gray-300 bg-white shadow-sm transition-all hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
        >
          {filtersOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Filters</span>
              <span className="sm:hidden">Hide</span>
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Show Filters</span>
              <span className="sm:hidden">Filters</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside
          className={`shrink-0 transition-all duration-300 ease-in-out ${
            filtersOpen ? "w-full lg:w-64 lg:opacity-100" : "hidden lg:hidden"
          }`}
        >
          <ProductFilters categories={categories} />
        </aside>

        <main className="flex-1 transition-all duration-300">
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  );
}
