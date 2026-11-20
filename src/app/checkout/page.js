"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-ink-500">
            You will be charged once, for all sellers in your cart.
          </p>
        </header>

        <CheckoutClient />
      </div>
    </RequireAuth>
  );
}