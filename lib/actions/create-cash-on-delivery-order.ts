"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type DeliveryDetails = {
  address: string;
  lat: number;
  lng: number;
  fee: number;
  distanceKm: number;
};

type CreateCodOrderResult = {
  success: boolean;
  error?: string;
  url?: string;
};

export async function createCashOnDeliveryOrder(
  _items: CartItem[],
  _delivery: DeliveryDetails,
): Promise<CreateCodOrderResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return { success: false, error: "Please sign in to place an order." };
  }

  const baseUrl = (
    process.env.AFRIGOALS_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");

  const res = await fetch(`${baseUrl}/api/v1/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: _items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      deliveryAddress: _delivery.address,
      deliveryLat: _delivery.lat,
      deliveryLng: _delivery.lng,
      deliveryFee: _delivery.fee,
      deliveryDistanceKm: _delivery.distanceKm,
      paymentMethod: "cod",
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error: (data as any)?.error || "Failed to create order.",
    };
  }

  const orderId = (data as any)?.id;
  return {
    success: true,
    url: orderId ? `/orders/${orderId}` : "/orders",
  };
}
