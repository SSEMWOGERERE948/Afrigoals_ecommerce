"use server";

import crypto from "node:crypto";
import axios from "axios";
import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { serverClient } from "@/sanity/lib/serverClient";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import { getPesapalToken } from "@/lib/pesapal/auth";
import { reserveStockForOrder, releaseReservedStockForOrder } from "@/lib/orders/stock";
import { patchPublished } from "@/lib/sanity/patchPublished";

const BASE_URL = process.env.PESAPAL_BASE_URL!;

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

type SanityProduct = {
  _id: string;
  name: string | null;
  slug?: string | null;
  price: number | null;
  image?: {
    asset?: {
      _id: string;
      url: string | null;
    } | null;
    hotspot?: unknown | null;
  } | null;
  stock: number | null;
  reservedStock?: number | null;
};

type ValidatedItem = {
  product: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    reservedStock: number;
  };
  quantity: number;
};

export async function createCheckoutSession(
  items: CartItem[]
): Promise<CheckoutResult> {
  let createdOrder:
    | {
        _id: string;
        items: Array<{
          _key: string;
          quantity: number;
          priceAtPurchase: number;
          productName: string;
          product: {
            _type: "reference";
            _ref: string;
          };
        }>;
      }
    | null = null;

  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: "Please sign in to checkout" };
    }

    if (!items?.length) {
      return { success: false, error: "Your cart is empty" };
    }

    const productIds = items.map((item) => item.productId);

    // ✅ Read-only query — plain client is fine here
    const products: SanityProduct[] = await client.fetch(PRODUCTS_BY_IDS_QUERY, {
      ids: productIds,
    });

    const validationErrors: string[] = [];
    const validatedItems: ValidatedItem[] = [];

    for (const item of items) {
      const product = products.find((p) => p._id === item.productId);

      if (!product) {
        validationErrors.push(`Product "${item.name}" no longer exists`);
        continue;
      }

      const productName = product.name ?? item.name ?? "Unnamed product";
      const stock = Number(product.stock ?? 0);
      const reservedStock = Number(product.reservedStock ?? 0);
      const price = Number(product.price ?? 0);
      const availableStock = stock - reservedStock;

      if (price <= 0) {
        validationErrors.push(`"${productName}" has an invalid price`);
        continue;
      }

      if (availableStock <= 0) {
        validationErrors.push(`${productName} is out of stock`);
        continue;
      }

      if (item.quantity > availableStock) {
        validationErrors.push(
          `Only ${availableStock} of "${productName}" available`
        );
        continue;
      }

      validatedItems.push({
        product: {
          _id: product._id,
          name: productName,
          price,
          stock,
          reservedStock,
        },
        quantity: item.quantity,
      });
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
    const userFirstName = user.firstName || "Customer";
    const userLastName = user.lastName || "User";

    const totalAmount = validatedItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    if (totalAmount <= 0) {
      return { success: false, error: "Invalid order total" };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      return {
        success: false,
        error: "NEXT_PUBLIC_BASE_URL is missing",
      };
    }

    if (!process.env.PESAPAL_IPN_ID) {
      return {
        success: false,
        error: "PESAPAL_IPN_ID is missing",
      };
    }

    const orderNumber = `ORDER-${Date.now()}`;
    const reservationExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    // Generate a stable document ID upfront so we control it
    // Using createOrReplace with an explicit _id publishes the document
    // immediately — no draft created, no Studio publish step needed.
    // This means patchPublished can always find it as a published doc.
    const documentId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    // ✅ createOrReplace publishes immediately (no "drafts." prefix)
    createdOrder = await serverClient.createOrReplace({
      _id: documentId,
      _type: "order",
      orderNumber,
      clerkUserId: userId,
      email: userEmail,
      status: "unpaid",
      currency: "UGX",
      total: totalAmount,
      paymentMethod: "pesapal",
      pesapalMerchantReference: orderNumber,
      pesapalTrackingId: null,
      pesapalPaymentId: null,
      pesapalStatus: "INITIATED",
      paymentRedirectUrl: null,
      stockReserved: false,
      stockDeducted: false,
      reservationExpiresAt,
      paidAt: null,
      createdAt: new Date().toISOString(),
      items: validatedItems.map((item) => ({
        _key: crypto.randomUUID(),
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        productName: item.product.name,
        product: {
          _type: "reference" as const,
          _ref: item.product._id,
        },
      })),
    });

    // reserveStockForOrder already uses serverClient internally
    await reserveStockForOrder({
      _id: createdOrder._id,
      stockReserved: false,
      stockDeducted: false,
      items: createdOrder.items,
    });

    const token = await getPesapalToken();

    const payload = {
      id: orderNumber,
      currency: "UGX",
      amount: totalAmount,
      description: "AfriGoals Store Order",
      callback_url: `${baseUrl}/api/pesapal/callback`,
      notification_id: process.env.PESAPAL_IPN_ID,
      billing_address: {
        email_address: userEmail,
        phone_number: "",
        country_code: "UG",
        first_name: userFirstName,
        last_name: userLastName,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/Transactions/SubmitOrderRequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const redirectUrl =
      response.data?.redirect_url ||
      response.data?.payment_redirect_url ||
      response.data?.redirectUrl;

    const trackingId =
      response.data?.order_tracking_id ||
      response.data?.tracking_id ||
      null;

    if (!redirectUrl) {
      // ✅ Write — serverClient
      await releaseReservedStockForOrder({
        _id: createdOrder._id,
        stockReserved: true,
        stockDeducted: false,
        items: createdOrder.items,
      });

      await patchPublished(createdOrder._id, {
        status: "payment_init_failed",
        pesapalStatus: "REDIRECT_URL_MISSING",
      });

      return {
        success: false,
        error:
          response.data?.message ||
          response.data?.error ||
          "Pesapal did not return a redirect URL",
      };
    }

    // ✅ Write — patchPublished hits both published + draft
    await patchPublished(createdOrder._id, {
      pesapalTrackingId: trackingId,
      pesapalPaymentId: trackingId,
      pesapalStatus: "PENDING",
      paymentRedirectUrl: redirectUrl,
    });

    return {
      success: true,
      url: redirectUrl,
    };
  } catch (error: any) {
    console.error(
      "Pesapal checkout error:",
      error?.response?.data || error?.message || error
    );

    if (createdOrder?._id) {
      try {
        // ✅ Write — serverClient
        await releaseReservedStockForOrder({
          _id: createdOrder._id,
          stockReserved: true,
          stockDeducted: false,
          items: createdOrder.items,
        });

        await patchPublished(createdOrder._id, {
          status: "payment_init_failed",
          pesapalStatus:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "PAYMENT_INIT_FAILED",
        });
      } catch (patchError) {
        console.error("Failed to recover failed order:", patchError);
      }
    }

    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to initialize payment",
    };
  }
}