import { NextResponse } from "next/server";
import {
  getCatalogProductsByIds,
  queryCatalogProducts,
} from "@/lib/catalog/query";
import type { CatalogProduct } from "@/lib/catalog/types";

export const dynamic = "force-dynamic";

function parseIds(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return Array.from(
    new Set(
      input.filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0,
      ),
    ),
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: unknown };
    const ids = parseIds(body.ids);

    if (ids.length === 0) {
      return NextResponse.json([] satisfies CatalogProduct[], {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const cartProducts = await getCatalogProductsByIds(ids);
    const preferredCategory = cartProducts.find((p) => p.category?.slug)
      ?.category?.slug;

    const excludedIds = new Set(ids);
    const inSameCategory = preferredCategory
      ? await queryCatalogProducts({ categorySlug: preferredCategory })
      : await queryCatalogProducts({});

    const picks = inSameCategory
      .filter((p) => !excludedIds.has(p._id))
      .slice(0, 3);

    return NextResponse.json(picks, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load cart recommendations:", error);

    return NextResponse.json(
      { error: "Failed to load cart recommendations" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 500,
      },
    );
  }
}
