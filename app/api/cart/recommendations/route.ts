import { NextResponse } from "next/server";
import {
  CART_RECOMMENDATIONS_QUERY,
  FALLBACK_CART_RECOMMENDATIONS_QUERY,
} from "@/lib/sanity/queries/products";
import { client } from "@/sanity/lib/client";
import type { FILTER_PRODUCTS_BY_NAME_QUERYResult } from "@/sanity.types";

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
      return NextResponse.json(
        [] satisfies FILTER_PRODUCTS_BY_NAME_QUERYResult,
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const relatedProducts = (await client.fetch(CART_RECOMMENDATIONS_QUERY, {
      ids,
    })) as FILTER_PRODUCTS_BY_NAME_QUERYResult;

    if (relatedProducts.length >= 3) {
      return NextResponse.json(relatedProducts.slice(0, 3), {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const excludedIds = [
      ...ids,
      ...relatedProducts.map((product) => product._id),
    ];

    const fallbackProducts = (await client.fetch(
      FALLBACK_CART_RECOMMENDATIONS_QUERY,
      { ids: excludedIds },
    )) as FILTER_PRODUCTS_BY_NAME_QUERYResult;

    return NextResponse.json(
      [...relatedProducts, ...fallbackProducts].slice(0, 3),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
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
