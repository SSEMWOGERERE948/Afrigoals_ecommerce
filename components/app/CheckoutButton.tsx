"use client";

import { useState, useTransition } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartItems } from "@/lib/store/cart-store-provider";
import { createCheckoutSession } from "@/lib/actions/checkout";

interface CheckoutButtonProps {
  disabled?: boolean;
}

export function CheckoutButton({ disabled }: CheckoutButtonProps) {
  const items = useCartItems();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (!items.length) return;

    setError(null);

    startTransition(async () => {
      try {
        const result = await createCheckoutSession(items);

        if (!result.success) {
          const message =
            result.error || "Payment initialization failed. Please try again.";

          setError(message);

          toast.error("Pesapal Checkout Error", {
            description: message,
          });

          return;
        }

        if (!result.url) {
          const message = "Payment gateway did not return a redirect URL.";

          setError(message);

          toast.error("Pesapal Error", {
            description: message,
          });

          return;
        }

        window.location.href = result.url;
      } catch (err: any) {
        console.error("Checkout error:", err);

        const message =
          err?.message || "Unexpected error while starting payment.";

        setError(message);

        toast.error("Checkout Failed", {
          description: message,
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleCheckout}
        disabled={disabled || isPending || items.length === 0}
        size="lg"
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Connecting to Pesapal...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay with Pesapal
          </>
        )}
      </Button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center">
          <p className="font-medium">Payment could not be started</p>
          <p>{error}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Secure payment via Pesapal • Mobile Money • Visa • Mastercard
      </p>
    </div>
  );
}