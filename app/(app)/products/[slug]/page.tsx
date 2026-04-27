import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductGrid } from "@/components/app/ProductGrid";
import { ProductInfo } from "@/components/app/ProductInfo";
import {
  getCatalogProductBySlug,
  queryCatalogProducts,
} from "@/lib/catalog/query";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (
    await queryCatalogProducts({
      categorySlug: product.category?.slug ?? "",
    })
  )
    .filter((item) => item._id !== product._id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary/80"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Products
        </Link>

        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        {relatedProducts.length > 0 && (
          <section className="border-t border-gray-200 py-12 dark:border-gray-700">
            <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
              Related Products
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
