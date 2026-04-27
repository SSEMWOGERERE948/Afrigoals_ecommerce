export const ORDER_STATUSES = [
  "pending",
  "unpaid",
  "paid",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "payment_failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function formatOrderStatus(status: string) {
  switch (status) {
    case "out_for_delivery":
      return "Out for delivery";
    case "payment_failed":
      return "Payment failed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
