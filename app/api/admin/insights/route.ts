export async function GET() {
  return Response.json(
    {
      success: false,
      error:
        "Admin insights are disabled while migrating analytics from Sanity to Postgres.",
    },
    { status: 501 },
  );
}
