"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { resend } from "./resend";

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

function formatUGX(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function createCashOnDeliveryOrder(
  items: CartItem[],
  delivery: DeliveryDetails
): Promise<CreateCodOrderResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to place an order.",
      };
    }

    const user = await currentUser();

    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      null;

    const fullName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.username ||
      "Customer";

    if (!email) {
      return {
        success: false,
        error: "No email address was found on your account.",
      };
    }

    if (!items.length) {
      return {
        success: false,
        error: "Your cart is empty.",
      };
    }

    if (
      !delivery.address ||
      delivery.lat == null ||
      delivery.lng == null ||
      delivery.fee == null ||
      delivery.distanceKm == null
    ) {
      return {
        success: false,
        error: "Delivery details are incomplete.",
      };
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const total = subtotal + delivery.fee;
    const orderNumber = `COD-${Date.now()}`;

    // TODO: Replace this block with your actual DB save logic.
    // Example fields to save:
    // - orderNumber
    // - userId
    // - email
    // - paymentMethod = "cod"
    // - paymentStatus = "pending"
    // - orderStatus = "pending_confirmation"
    // - subtotal
    // - deliveryFee
    // - total
    // - deliveryAddress
    // - deliveryLat
    // - deliveryLng
    // - deliveryDistanceKm
    // - items[]

    const itemsHtml = items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 0;">${item.name}</td>
            <td style="padding:8px 0; text-align:center;">${item.quantity}</td>
            <td style="padding:8px 0; text-align:right;">${formatUGX(
              item.price * item.quantity
            )}</td>
          </tr>
        `
      )
      .join("");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Order Received - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 8px;">Cash on Delivery Order Received</h2>
          <p>Hello ${fullName},</p>
          <p>Your order has been received successfully.</p>

          <div style="margin: 16px 0; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0 0 8px;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 0 0 8px;"><strong>Payment Method:</strong> Cash on Delivery</p>
            <p style="margin: 0 0 8px;"><strong>Delivery Address:</strong> ${delivery.address}</p>
            <p style="margin: 0;"><strong>Delivery Distance:</strong> ${delivery.distanceKm.toFixed(
              1
            )} km</p>
          </div>

          <h3 style="margin-top: 24px;">Order Summary</h3>
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px 0; border-bottom:1px solid #e5e7eb;">Item</th>
                <th style="text-align:center; padding:8px 0; border-bottom:1px solid #e5e7eb;">Qty</th>
                <th style="text-align:right; padding:8px 0; border-bottom:1px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 6px;"><strong>Subtotal:</strong> ${formatUGX(subtotal)}</p>
            <p style="margin: 0 0 6px;"><strong>Delivery Fee:</strong> ${formatUGX(
              delivery.fee
            )}</p>
            <p style="margin: 0;"><strong>Total:</strong> ${formatUGX(total)}</p>
          </div>

          <p style="margin-top: 24px;">
            Please keep your phone available. Payment will be made when the order is delivered.
          </p>
        </div>
      `,
    });

    return {
      success: true,
      url: `/checkout/success?paymentMethod=cod&order=${encodeURIComponent(
        orderNumber
      )}`,
    };
  } catch (error) {
    console.error("createCashOnDeliveryOrder error:", error);

    return {
      success: false,
      error: "Failed to create the cash on delivery order.",
    };
  }
}