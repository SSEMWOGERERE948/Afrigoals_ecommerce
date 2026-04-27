export type CatalogCategory = {
  _id: string;
  title: string;
  slug: string;
  imageUrl?: string;
};

export type CatalogProduct = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  dimensions?: string | null;
  assemblyRequired?: boolean | null;
  currency: string;
  price: number;
  compareAtPrice?: number | null;
  soldCount?: number | null;
  stock: number;
  featured?: boolean;
  hasSizes?: boolean | null;
  sizes?: Array<{
    _key: string;
    size: string;
    stock: number;
  }> | null;
  material?: string | null;
  color?: string | null;
  images: string[];
  category?: {
    _id: string;
    title: string;
    slug: string;
  } | null;
};
