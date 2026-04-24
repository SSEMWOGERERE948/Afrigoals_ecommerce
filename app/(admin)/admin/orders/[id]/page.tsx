import Link from "next/link";

export default function AdminOrderDetailPage() {
  return (
    <div className="space-y-3">
      <Link className="text-sm underline" href="/admin/orders">
        ← Back to Orders
      </Link>
      <h1 className="text-2xl font-bold">Order details not wired up yet</h1>
      <p className="text-sm text-muted-foreground">
        This will be enabled once orders are stored in Postgres via the Go API.
      </p>
    </div>
  );
}
