import { apiGet } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/types";
import { ProductSection } from "@/components/app/ProductSection";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const searchQuery = params.q ?? "";

  const products = await apiGet<ApiProduct[]>(
    `/api/v1/products${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 pt-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Browse Products"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quality sports attire, shoes and equipment from Afrigoals vendors.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProductSection products={products} searchQuery={searchQuery} />
      </div>
    </div>
  );
}
