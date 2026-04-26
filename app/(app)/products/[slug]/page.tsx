import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/types";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: ApiProduct | null = null;
  try {
    product = await apiGet<ApiProduct>(
      `/api/v1/products/slug/${encodeURIComponent(slug)}`,
    );
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <ProductGallery
            images={product.images ?? []}
            productName={product.name ?? "Product"}
          />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
