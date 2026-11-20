"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { confirmPayment, fetchOrder } from "@/lib/api/orders";
import { Spinner } from "@/components/auth/AuthCard";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  // start in the failure state when there is no reference, so no setState happens
  // synchronously inside the effect
  const [state, setState] = useState(() =>
    paymentIntentId
      ? { status: "checking" }
      : { status: "problem", message: "No payment reference in the URL" }
  );

  useEffect(() => {
    let cancelled = false;

    async function verify(attempt = 0) {
      try {
        const result = await confirmPayment(paymentIntentId);
        const orderIds = result.orders ?? [];
        const order = orderIds.length ? await fetchOrder(orderIds[0]) : null;
        if (!cancelled) setState({ status: "paid", order, result });
      } catch (err) {
        const message = err.response?.data?.message ?? "";
        // the webhook may not have landed yet; retry briefly before giving up
        if (attempt < 3 && /not completed|not found|pending/i.test(message)) {
          setTimeout(() => verify(attempt + 1), 1500);
          return;
        }
        if (!cancelled) setState({ status: "problem", message });
      }
    }

    if (!paymentIntentId) return;
    verify();

    return () => {
      cancelled = true;
    };
  }, [paymentIntentId]);

  if (state.status === "checking") {
    return (
      <div className="grid place-items-center gap-4 py-16 text-center">
        <Spinner />
        <p className="text-sm text-ink-500">Confirming your payment…</p>
      </div>
    );
  }

  if (state.status === "problem") {
    return (
      <div className="py-12 text-center">
        <XCircle className="mx-auto size-12 text-red-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold">We could not confirm that payment</h1>
        <p className="mt-2 text-sm text-ink-500">{state.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/dashboard/orders">My orders</ButtonLink>
          <ButtonLink href="/cart" variant="outline">Back to cart</ButtonLink>
        </div>
      </div>
    );
  }

  const { order, result } = state;

  return (
    <div className="py-10">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-brand-600" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Payment received</h1>
        <p className="mt-2 text-ink-500">
          {order ? `We sent your order to ${order.sellerInfo?.name || "the seller"}.` : "Your order is confirmed."}
        </p>
      </div>

      <section className="mx-auto mt-8 max-w-lg rounded-2xl border border-ink-200 p-5 text-sm dark:border-ink-800">
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Transaction</dt>
            <dd className="truncate font-mono text-xs">{order?.transactionId ?? "pending webhook"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Date</dt>
            <dd>{new Date().toLocaleString()}</dd>
          </div>
          {order && (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Delivery</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ink-200 pt-2 text-base font-semibold dark:border-ink-800">
                <dt>Total paid</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </>
          )}
        </dl>
        {result?.paymentRecorded === false && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-amber-600">
            <Clock className="size-3.5" aria-hidden /> Already recorded by another request
          </p>
        )}
      </section>

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/dashboard/orders">View my orders</ButtonLink>
        <ButtonLink href="/products" variant="outline">Keep browsing</ButtonLink>
      </div>

      <p className="mt-8 text-center text-xs text-ink-400">
        Need the receipt later?{" "}
        <Link href="/dashboard/payments" className="text-brand-700 hover:underline">Payment history</Link>
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="grid min-h-[50vh] place-items-center">
            <Spinner />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}