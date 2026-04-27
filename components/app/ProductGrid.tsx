import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { CatalogProduct } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: CatalogProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="min-h-[400px] rounded-lg border-2 border-dashed border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @xl:grid-cols-3 @6xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
