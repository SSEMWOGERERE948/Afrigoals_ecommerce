// lib/constants/orderStatus.ts
import {
  Package,
  Truck,
  XCircle,
  CreditCard,
  Clock,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type OrderStatusValue =
  | "unpaid"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed"
  | "payment_init_failed";

export interface OrderStatusConfig {
  value: OrderStatusValue;
  label: string;
  color: string;
  icon: LucideIcon;
  emoji: string;
  iconColor: string;
  iconBgColor: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatusValue, OrderStatusConfig> =
  {
    unpaid: {
      value: "unpaid",
      label: "Unpaid",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      icon: Clock,
      emoji: "⏳",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    paid: {
      value: "paid",
      label: "Paid",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: CreditCard,
      emoji: "✅",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    shipped: {
      value: "shipped",
      label: "Shipped",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Truck,
      emoji: "📦",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    delivered: {
      value: "delivered",
      label: "Delivered",
      color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
      icon: Package,
      emoji: "🎉",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    cancelled: {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: XCircle,
      emoji: "❌",
      iconColor: "text-red-600 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
    },
    payment_failed: {
      value: "payment_failed",
      label: "Payment Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: AlertTriangle,
      emoji: "⚠️",
      iconColor: "text-red-600 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
    },
    payment_init_failed: {
      value: "payment_init_failed",
      label: "Init Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: AlertTriangle,
      emoji: "⚠️",
      iconColor: "text-red-600 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
    },
  };

/** All valid order status values */
export const ORDER_STATUS_VALUES = Object.keys(
  ORDER_STATUS_CONFIG,
) as OrderStatusValue[];

/** Tabs for admin order filtering (includes "all" option) */
export const ORDER_STATUS_TABS = [
  { value: "all", label: "All" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value].label,
  })),
] as const;

/** Format for Sanity schema options.list */
export const ORDER_STATUS_SANITY_LIST = ORDER_STATUS_VALUES.map((value) => ({
  title: ORDER_STATUS_CONFIG[value].label,
  value,
}));

/** Get order status config with fallback to "unpaid" */
export const getOrderStatus = (
  status: string | null | undefined,
): OrderStatusConfig =>
  ORDER_STATUS_CONFIG[status as OrderStatusValue] ?? ORDER_STATUS_CONFIG.unpaid;

/** Get emoji display for status (for AI/chat) */
export const getOrderStatusEmoji = (
  status: string | null | undefined,
): string => {
  const config = getOrderStatus(status);
  return `${config.emoji} ${config.label}`;
};
