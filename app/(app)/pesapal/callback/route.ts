import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Pesapal callback is disabled while migrating orders from Sanity to Postgres.",
    },
    { status: 501 },
  );
}
