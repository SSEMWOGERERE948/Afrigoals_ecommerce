import type { ApiProduct } from "@/lib/api/types";
import type { CatalogProduct } from "@/lib/catalog/types";

export function apiProductToCatalogProduct(
  product: ApiProduct,
): CatalogProduct {
  return {
    _id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    currency: product.currency,
    price: product.price,
    images: product.images ?? [],
    stock: product.stock ?? 0,
    compareAtPrice: null,
    soldCount: null,
    featured: false,
    hasSizes: false,
    sizes: null,
    material: null,
    color: null,
    category: null,
    dimensions: null,
    assemblyRequired: null,
  };
}
