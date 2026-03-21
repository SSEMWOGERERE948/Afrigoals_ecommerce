import axios from "axios";
import { getPesapalToken } from "@/lib/pesapal/auth";

const BASE_URL = process.env.PESAPAL_BASE_URL!;

export type NormalizedPaymentStatus = "paid" | "unpaid" | "failed";

interface VerifyResult {
  rawStatus: string;
  normalizedStatus: NormalizedPaymentStatus;
  payload: any;
}

export async function verifyPesapalTransaction(
  orderTrackingId: string
): Promise<VerifyResult> {
  const token = await getPesapalToken();

  const response = await axios.get(
    `${BASE_URL}/Transactions/GetTransactionStatus`,
    {
      params: {
        orderTrackingId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 30000,
    }
  );

  const data = response.data ?? {};

  const rawStatus = String(
    data.payment_status_description ||
      data.status ||
      data.payment_status ||
      "UNKNOWN"
  );

  const normalized = rawStatus.toLowerCase();

  let normalizedStatus: NormalizedPaymentStatus = "unpaid";

  if (
    normalized.includes("completed") ||
    normalized.includes("paid") ||
    normalized.includes("success")
  ) {
    normalizedStatus = "paid";
  } else if (
    normalized.includes("failed") ||
    normalized.includes("invalid") ||
    normalized.includes("cancelled") ||
    normalized.includes("reversed")
  ) {
    normalizedStatus = "failed";
  } else {
    normalizedStatus = "unpaid";
  }

  return {
    rawStatus,
    normalizedStatus,
    payload: data,
  };
}