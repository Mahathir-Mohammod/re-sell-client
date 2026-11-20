"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";
import { createPaymentIntent } from "@/lib/api/orders";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const field =
  "w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800";

function PaymentFields({ amountCents }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError("");
    setSubmitting(true);

    // Stripe Elements validates and confirms in one call for the payment element
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setSubmitting(false);
      setError(stripeError.message ?? "Payment failed");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    router.push(`/payment/success?payment_intent=${paymentIntent.id}`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-ink-500">
        <span>Total charged</span>
        <span className="font-semibold text-ink-900 dark:text-white">{formatPrice(amountCents / 100)}</span>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!stripe || !elements}>
        Pay {formatPrice(amountCents / 100)}
      </Button>

      <p className="text-center text-xs text-ink-400">
        Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
      </p>
    </form>
  );
}

export function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({ address: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [clientSecret, setClientSecret] = useState(null);
  // the cart is emptied once the order exists; keep a copy for the summary
  const [snapshot, setSnapshot] = useState(null);
  const [amountCents, setAmountCents] = useState(0);
  const [creating, setCreating] = useState(false);

  const total = useMemo(() => subtotal, [subtotal]);

  const startPayment = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (form.address.trim().length < 10) nextErrors.address = "Please enter your full delivery address";
    if (form.phone.trim().length < 6) nextErrors.phone = "Please enter a contact phone number";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setCreating(true);
    try {
      const intent = await createPaymentIntent({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address: form.address.trim(),
        phone: form.phone.trim(),
      });
      setSnapshot(items);
      setClientSecret(intent.clientSecret);
      setAmountCents(Math.round(intent.amount * 100));
      // the cart is replaced by the pending order from here on
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not start checkout");
    } finally {
      setCreating(false);
    }
  };

  const lines = snapshot ?? items;

  if (lines.length === 0 && !clientSecret) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 p-12 text-center dark:border-ink-800">
        <p className="text-ink-500">Your cart is empty.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {clientSecret ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Card details</h2>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <PaymentFields amountCents={amountCents} />
            </Elements>
          </>
        ) : (
          <form onSubmit={startPayment} className="space-y-4">
            <h2 className="text-lg font-semibold">Delivery details</h2>

            <div className="space-y-1.5">
              <label htmlFor="address" className="text-sm font-medium">Delivery address</label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, postal code"
                className={field}
              />
              {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 000 0000"
                className={field}
              />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={creating}>
              Continue to payment
            </Button>
          </form>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Order summary</h2>
        <ul className="mt-3 space-y-3">
          {lines.map((item) => (
            <li key={item.productId} className={cn("flex items-start justify-between gap-3 text-sm")}>
              <span className="min-w-0">
                <span className="line-clamp-1">{item.title}</span>
                <span className="text-xs text-ink-500">x{item.quantity}</span>
              </span>
              <span className="whitespace-nowrap font-medium">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-ink-200 pt-3 text-sm dark:border-ink-800">
          <div className="flex justify-between">
            <span className="text-ink-500">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Delivery</span>
            <span>added per seller at payment</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{clientSecret ? formatPrice(amountCents / 100) : formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}