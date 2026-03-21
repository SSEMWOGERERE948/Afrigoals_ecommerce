import { redirect } from "next/navigation";
import { SuccessClient } from "./SuccessClient";
import { createCheckoutSession } from "@/lib/actions/checkout";
export const metadata = {
  title: "Order Confirmed | sports merchandiseShop",
  description: "Your order has been placed successfully",
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/");
  }

  const result = await createCheckoutSession([]);

  if (!result.success || !result.url) {
    redirect("/");
  }

}
