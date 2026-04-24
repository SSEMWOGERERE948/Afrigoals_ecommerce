import { tool } from "ai";
import { z } from "zod";

const schema = z.object({
  status: z.string().optional().default(""),
});

export interface OrderSummary {
  id: string;
  orderNumber: string | null;
  total: number | null;
  totalFormatted: string | null;
  status: string | null;
  statusDisplay: string;
  itemCount: number;
  itemNames: string[];
  itemImages: string[];
  createdAt: string | null;
  orderUrl: string;
}

export interface GetMyOrdersResult {
  found: boolean;
  message: string;
  orders: OrderSummary[];
  totalOrders: number;
  isAuthenticated: boolean;
}

export function createGetMyOrdersTool(_userId: string | null) {
  return tool({
    description:
      "Get the current user's orders (not implemented yet in Postgres).",
    inputSchema: schema,
    execute: async () => {
      return {
        found: false,
        message:
          "Order history is not available yet. Orders are still being migrated to Postgres.",
        orders: [],
        totalOrders: 0,
        isAuthenticated: false,
      } satisfies GetMyOrdersResult;
    },
  });
}
