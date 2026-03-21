// app/api/pesapal/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";
import { ORDER_BY_PESAPAL_MERCHANT_REFERENCE_QUERY } from "@/lib/sanity/queries/orders";
import { verifyPesapalTransaction } from "@/lib/pesapal/verify-payment";
import { captureReservedStockForPaidOrder } from "@/lib/orders/stock";
import { patchPublished } from "@/lib/sanity/patchPublished";

export async function GET(req: NextRequest) {
  try {
    const allParams: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((v, k) => { allParams[k] = v; });

    // ⚠️ This MUST appear in your server logs when Pesapal fires the IPN.
    // If you never see this log, your IPN URL is wrong in Pesapal's dashboard.
    console.log("=== Pesapal IPN received ===", allParams);

    const merchantReference = req.nextUrl.searchParams.get("OrderMerchantReference");
    const trackingId = req.nextUrl.searchParams.get("OrderTrackingId");
    const notificationType = req.nextUrl.searchParams.get("OrderNotificationType");

    if (!merchantReference || !trackingId) {
      console.error("IPN: missing required params");
      return NextResponse.json(
        { success: false, message: "Missing OrderMerchantReference or OrderTrackingId" },
        { status: 400 }
      );
    }

    // ✅ serverClient bypasses CDN — reads published docs without cache delay
    const order = await serverClient.fetch(
      ORDER_BY_PESAPAL_MERCHANT_REFERENCE_QUERY,
      { pesapalMerchantReference: merchantReference }
    );

    if (!order?._id) {
      console.error("IPN: order not found for merchantRef:", merchantReference);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    console.log("IPN: found order", { _id: order._id, status: order.status });

    // Idempotency
    if (order.status === "paid") {
      console.log("IPN: order already paid, skipping");
      return NextResponse.json({
        success: true,
        message: "Order already paid",
        orderId: order._id,
      });
    }

    const verification = await verifyPesapalTransaction(trackingId);
    console.log("IPN verification:", {
      raw: verification.rawStatus,
      normalized: verification.normalizedStatus,
    });

    const isNowPaid = verification.normalizedStatus === "paid";
    const isFailed = verification.normalizedStatus === "failed";

    await patchPublished(order._id, {
      status: isNowPaid ? "paid" : isFailed ? "payment_failed" : order.status,
      pesapalTrackingId: trackingId,
      pesapalPaymentId: trackingId,
      pesapalStatus: verification.rawStatus.toUpperCase(),
      paidAt: isNowPaid
        ? order.paidAt || new Date().toISOString()
        : order.paidAt ?? null,
    });

    if (isNowPaid) {
      console.log("IPN: marking order as paid and capturing stock", order._id);
      await captureReservedStockForPaidOrder({
        _id: order._id,
        stockReserved: order.stockReserved ?? false,
        stockDeducted: order.stockDeducted ?? false,
        items: order.items ?? [],
      });
    }

    return NextResponse.json({
      success: true,
      message: "IPN processed successfully",
      orderId: order._id,
      paymentStatus: verification.normalizedStatus,
      rawStatus: verification.rawStatus,
    });
  } catch (error: any) {
    console.error("=== Pesapal IPN error ===", error?.message, error?.response?.data);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process IPN" },
      { status: 500 }
    );
  }
}