// app/(app)/orders/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, CreditCard, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDER_BY_ID_QUERY } from "@/lib/sanity/queries/orders";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Order Details | AfriGoals Store",
  description: "View your order details",
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

function PaymentBanner({ payment }: { payment?: string }) {
  if (!payment) return null;

  if (payment === "success") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-4 dark:border-green-800 dark:bg-green-950/40">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">
            Payment received successfully!
          </p>
          <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
            Thank you for your purchase. Your order has been confirmed and is
            being processed.
          </p>
        </div>
      </div>
    );
  }

  if (payment === "pending") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/40">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Payment is being processed
          </p>
          <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
            Your payment is pending confirmation. This page will update once
            your payment is verified.
          </p>
        </div>
      </div>
    );
  }

  if (payment === "already_paid") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-4 dark:border-green-800 dark:bg-green-950/40">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">
            This order has already been paid
          </p>
          <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
            Your order is confirmed and being processed.
          </p>
        </div>
      </div>
    );
  }

  if (payment === "failed") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 dark:border-red-800 dark:bg-red-950/40">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <p className="font-semibold text-red-800 dark:text-red-300">
            Payment was not completed
          </p>
          <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
            Your payment could not be processed. Please try again or contact
            support.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { id } = await params;
  const { payment } = await searchParams;
  const { userId } = await auth();

  const { data: order } = await sanityFetch({
    query: ORDER_BY_ID_QUERY,
    params: { id },
  });

  // Verify order exists and belongs to current user
  if (!order || order.clerkUserId !== userId) {
    notFound();
  }

  const status = getOrderStatus(order.status);
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Placed on {formatDate(order.createdAt, "datetime")}
            </p>
          </div>
          <Badge className={`${status.color} flex items-center gap-1.5`}>
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Payment Status Banner */}
      <PaymentBanner payment={payment} />

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Order Items */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Items ({order.items?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items?.map((item: any) => (
                <div key={item._key} className="flex gap-4 px-6 py-4">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {item.product?.image?.asset?.url ? (
                      <Image
                        src={item.product.image.asset.url}
                        alt={item.product.name ?? "Product"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
                      >
                        {item.product?.name ?? item.productName ?? "Unknown Product"}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(
                        (item.priceAtPurchase ?? 0) * (item.quantity ?? 1),
                      )}
                    </p>
                    {(item.quantity ?? 1) > 1 && (
                      <p className="text-sm text-zinc-500">
                        {formatPrice(item.priceAtPurchase)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">
                    Total
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Shipping Address
                </h2>
              </div>
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {order.address.name && <p>{order.address.name}</p>}
                {order.address.line1 && <p>{order.address.line1}</p>}
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {[order.address.city, order.address.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.address.country && <p>{order.address.country}</p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Payment
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light tracking-wide text-zinc-500 dark:text-zinc-400">
                  Status
                </span>
                <span
                  className={`font-medium capitalize ${
                    order.status === "paid"
                      ? "text-green-600 dark:text-green-400"
                      : order.status === "cancelled" ||
                          order.status === "payment_failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {order.status === "paid" ? "Paid" : order.status}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-light tracking-wide text-zinc-500 dark:text-zinc-400">
                    Paid on
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatDate(order.paidAt, "datetime")}
                  </span>
                </div>
              )}
              {order.email && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-light tracking-wide text-zinc-500 dark:text-zinc-400">
                    Email
                  </span>
                  <span className="min-w-0 truncate text-zinc-900 dark:text-zinc-100">
                    {order.email}
                  </span>
                </div>
              )}
              {order.pesapalTrackingId && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-light tracking-wide text-zinc-500 dark:text-zinc-400">
                    Ref
                  </span>
                  <span className="min-w-0 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {order.pesapalTrackingId.slice(0, 16)}…
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Continue Shopping */}
          {order.status === "paid" && (
            <Link
              href="/"
              className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}