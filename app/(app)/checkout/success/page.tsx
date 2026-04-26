// app/checkout/success/page.tsx
import { redirect } from "next/navigation";
import { SuccessClient } from "./SuccessClient";

export const metadata = {
  title: "Order Confirmed | AfriGoals Store",
  description: "Your order has been placed successfully",
};

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
    paymentMethod?: string;
    order?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id ?? null;
  const paymentMethod = params.paymentMethod ?? "pesapal";
  const orderNumber = params.order ?? null;

  // COD orders only need an order number
  if (paymentMethod === "cod" && !orderNumber) {
    redirect("/");
  }

  // Pesapal orders need a session id
  if (paymentMethod !== "cod" && !sessionId) {
    redirect("/");
  }

  return (
    <SuccessClient
      sessionId={sessionId}
      paymentMethod={paymentMethod}
      orderNumber={orderNumber}
    />
  );
}
