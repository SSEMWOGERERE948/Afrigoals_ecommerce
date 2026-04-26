import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ reviews: [] });
    }

    const sql = getSql();
    const reviews = await sql`
      SELECT 
        id AS "_id",
        name,
        rating,
        comment,
        created_at AS "createdAt"
      FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, name, rating, comment } = body;

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sql = getSql();
    await sql`
      INSERT INTO reviews (product_id, name, rating, comment)
      VALUES (${productId}, ${name}, ${rating}, ${comment})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
