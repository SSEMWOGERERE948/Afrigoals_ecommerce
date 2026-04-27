"use server";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type DeliveryInput = {
  address: string;
  lat: number;
  lng: number;
  fee: number;
  distanceKm: number;
};

type CheckoutResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function createCheckoutSession(
  _items: CartItem[],
  _delivery: DeliveryInput,
): Promise<CheckoutResult> {
  return {
    success: false,
    error:
      "Checkout is temporarily disabled while migrating orders/stock/pesapal from Sanity+Clerk to Postgres+Go API.",
  };
}
