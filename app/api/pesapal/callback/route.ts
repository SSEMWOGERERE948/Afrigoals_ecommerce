// app/api/pesapal/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";
import { verifyPesapalTransaction } from "@/lib/pesapal/verify-payment";
import { captureReservedStockForPaidOrder } from "@/lib/orders/stock";
import { patchPublished } from "@/lib/sanity/patchPublished";

const ORDER_BY_MERCHANT_REF_QUERY = `
  *[_type == "order" && pesapalMerchantReference == $merchantRef][0]{
    _id,
    orderNumber,
    status,
    stockReserved,
    stockDeducted,
    items[]{
      _key,
      quantity,
      priceAtPurchase,
      productName,
      product
    }
  }
`;

/**
 * Returns an HTML page that:
 * 1. Updates Sanity immediately (payment verification happens server-side)
 * 2. Breaks out of the Pesapal iframe using window.top.location
 * 3. Redirects the customer's full browser window to the order page
 *
 * WHY THIS IS NEEDED:
 * Pesapal loads inside an iframe on your checkout page.
 * When payment completes, Pesapal redirects the iframe to callback_url.
 * A normal NextResponse.redirect() only navigates the iframe — the customer
 * never sees the order page. We must use window.top.location to escape.
 */
function iframeBreakoutHtml(destination: string): NextResponse {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <style>
      body {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        background: #f9fafb;
        color: #374151;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e5e7eb;
        border-top-color: #111827;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        margin: 0 auto 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      p { margin: 0; font-size: 14px; }
    </style>
  </head>
  <body>
    <div>
      <div class="spinner"></div>
      <p>Confirming your order…</p>
    </div>
    <script>
      // Break out of the Pesapal iframe and redirect the top window
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = ${JSON.stringify(destination)};
        } else {
          window.location.href = ${JSON.stringify(destination)};
        }
      } catch (e) {
        // Cross-origin fallback
        window.location.href = ${JSON.stringify(destination)};
      }
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Log all params Pesapal sends
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => { allParams[key] = value; });
  console.log("=== Pesapal callback received ===", allParams);

  const orderTrackingId =
    searchParams.get("OrderTrackingId") ||
    searchParams.get("order_tracking_id");

  const merchantReference =
    searchParams.get("OrderMerchantReference") ||
    searchParams.get("order_merchant_reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!orderTrackingId || !merchantReference) {
    console.error("Pesapal callback: missing params:", allParams);
    return iframeBreakoutHtml(`${baseUrl}/?payment=failed&reason=missing_params`);
  }

  try {
    // Fetch fresh from API (not CDN) so we always get the real document
    const order = await serverClient.fetch(ORDER_BY_MERCHANT_REF_QUERY, {
      merchantRef: merchantReference,
    });

    if (!order) {
      console.error("Pesapal callback: order not found:", merchantReference);
      return iframeBreakoutHtml(`${baseUrl}/?payment=failed&reason=order_not_found`);
    }

    console.log("Pesapal callback: found order", {
      _id: order._id,
      status: order.status,
    });

    // Idempotency guard
    if (order.status === "paid") {
      return iframeBreakoutHtml(
        `${baseUrl}/orders/${order._id}?payment=already_paid`
      );
    }

    // Verify payment with Pesapal
    let verification: Awaited<ReturnType<typeof verifyPesapalTransaction>>;
    try {
      verification = await verifyPesapalTransaction(orderTrackingId);
      console.log("Pesapal verification:", {
        raw: verification.rawStatus,
        normalized: verification.normalizedStatus,
        payload: verification.payload,
      });
    } catch (verifyError: any) {
      console.error("Verification failed:", verifyError?.message);
      // Save tracking ID — IPN will finalize
      await patchPublished(order._id, {
        pesapalTrackingId: orderTrackingId,
        pesapalPaymentId: orderTrackingId,
        pesapalStatus: "VERIFICATION_PENDING",
      });
      return iframeBreakoutHtml(
        `${baseUrl}/orders/${order._id}?payment=pending`
      );
    }

    if (verification.normalizedStatus === "paid") {
      await patchPublished(order._id, {
        status: "paid",
        pesapalTrackingId: orderTrackingId,
        pesapalPaymentId: orderTrackingId,
        pesapalStatus: "COMPLETED",
        paidAt: new Date().toISOString(),
        ...(verification.payload?.payment_method
          ? { paymentMethod: verification.payload.payment_method }
          : {}),
      });

      await captureReservedStockForPaidOrder({
        _id: order._id,
        stockReserved: order.stockReserved ?? false,
        stockDeducted: order.stockDeducted ?? false,
        items: order.items ?? [],
      });

      console.log("Pesapal callback: order marked paid", order._id);
      return iframeBreakoutHtml(
        `${baseUrl}/orders/${order._id}?payment=success`
      );
    }

    if (verification.normalizedStatus === "failed") {
      await patchPublished(order._id, {
        status: "payment_failed",
        pesapalTrackingId: orderTrackingId,
        pesapalStatus: verification.rawStatus.toUpperCase(),
      });
      return iframeBreakoutHtml(
        `${baseUrl}/checkout?payment=failed&reason=${verification.rawStatus.toLowerCase()}`
      );
    }

    // Pending — IPN will finalize
    await patchPublished(order._id, {
      pesapalTrackingId: orderTrackingId,
      pesapalPaymentId: orderTrackingId,
      pesapalStatus: verification.rawStatus.toUpperCase(),
    });
    return iframeBreakoutHtml(
      `${baseUrl}/orders/${order._id}?payment=pending`
    );

  } catch (error: any) {
    console.error(
      "Pesapal callback fatal error:",
      error?.response?.data || error?.message || error
    );
    return iframeBreakoutHtml(
      `${baseUrl}/?payment=failed&reason=server_error`
    );
  }
}