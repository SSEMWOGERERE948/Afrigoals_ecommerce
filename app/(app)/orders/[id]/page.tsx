import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { authedFetch } from "@/lib/api/proxy";
import type { ApiOrder } from "@/lib/api/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/orders/status";

export const metadata = {
  title: "Order Details | AfriGoals Store",
  description: "View your order details",
};

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const res = await authedFetch(`/api/v1/orders/${encodeURIComponent(id)}`);
  if (res.status === 401) {
    redirect(`/signin?next=${encodeURIComponent(`/orders/${id}`)}`);
  }
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load this order.
        </p>
      </div>
    );
  }

  const order = (await res.json()) as ApiOrder;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="text-sm underline text-zinc-600 dark:text-zinc-300"
        href="/orders"
      >
        ← Back to Orders
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Placed on {formatDate(order.createdAt, "datetime")}
          </p>
        </div>
        <div className="text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Status: </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Items
          </h2>
          <div className="mt-4 space-y-3">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {item.productName}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-sm text-zinc-900 dark:text-zinc-100">
                  {formatPrice(
                    item.priceAtPurchase * item.quantity,
                    order.currency?.toLowerCase() || "ugx",
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
              <span>
                {formatPrice(
                  order.subtotal,
                  order.currency?.toLowerCase() || "ugx",
                )}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Delivery</span>
              <span>
                {formatPrice(
                  order.deliveryFee,
                  order.currency?.toLowerCase() || "ugx",
                )}
              </span>
            </div>
            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {formatPrice(
                  order.total,
                  order.currency?.toLowerCase() || "ugx",
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Delivery
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {order.deliveryAddress}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Distance:{" "}
              {order.deliveryDistanceKm?.toFixed?.(1) ??
                order.deliveryDistanceKm}{" "}
              km
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Tracking timeline
            </h2>
            <div className="mt-4 space-y-3">
              {(order.statusEvents ?? []).length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No updates yet.
                </p>
              ) : (
                order.statusEvents?.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatOrderStatus(e.status)}
                      </div>
                      {e.note ? (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {e.note}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(e.createdAt, "datetime")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
