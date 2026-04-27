import { NextResponse } from "next/server";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import { client } from "@/sanity/lib/client";
import type { PRODUCTS_BY_IDS_QUERYResult } from "@/sanity.types";

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
      return NextResponse.json([] satisfies PRODUCTS_BY_IDS_QUERYResult, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const products = (await client.fetch(PRODUCTS_BY_IDS_QUERY, {
      ids,
    })) as PRODUCTS_BY_IDS_QUERYResult;

    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load cart stock:", error);

    return NextResponse.json(
      { error: "Failed to load cart stock" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 500,
      },
    );
  }
}
