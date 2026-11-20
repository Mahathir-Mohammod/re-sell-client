"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cancelOrder, fetchOrder } from "@/lib/api/orders";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ORDER_FLOW, STATUS_TONE, canBuyerCancel } from "@/lib/orderStatus";
import { formatDate, formatPrice } from "@/lib/utils";

function OrderDetail({ id }) {
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not cancel"),
  });

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />;
  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 p-10 text-center dark:border-ink-800">
        <p className="text-ink-500">We could not load that order.</p>
        <Link href="/dashboard/orders" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const stepIndex = ORDER_FLOW.indexOf(order.orderStatus);
  const cancelled = ["cancelled", "rejected"].includes(order.orderStatus);

  return (
    <div>
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-ink-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
          <Badge tone={order.paymentStatus === "paid" ? "brand" : "amber"}>{order.paymentStatus}</Badge>
        </div>
      </header>

      {!cancelled && (
        <ol className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          {ORDER_FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={
                  i <= stepIndex
                    ? "rounded-full bg-brand-600 px-3 py-1 font-medium text-white"
                    : "rounded-full bg-ink-100 px-3 py-1 text-ink-500 dark:bg-ink-800"
                }
              >
                {step}
              </span>
              {i < ORDER_FLOW.length - 1 && <span className="text-ink-300">–</span>}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Items</h2>
          <ul className="mt-3 divide-y divide-ink-100 dark:divide-ink-800">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium">{item.title}</span>
                  <span className="text-xs text-ink-500">x{item.quantity}</span>
                </span>
                <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 border-t border-ink-200 pt-3 text-sm dark:border-ink-800">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery</dt>
              <dd>{formatPrice(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-semibold dark:border-ink-800">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
              <MapPin className="size-4" aria-hidden /> Delivery
            </h2>
            <p className="mt-2 text-sm">{order.deliveryAddress}</p>
            <p className="text-sm text-ink-500">{order.buyerInfo?.phone}</p>
          </section>

          <section className="rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
              <Receipt className="size-4" aria-hidden /> Payment
            </h2>
            <p className="mt-2 truncate font-mono text-xs">{order.transactionId ?? "awaiting payment"}</p>
            <p className="mt-1 text-sm text-ink-500">
              {order.transactionId ? `Charged ${formatPrice(order.total)}` : "Not charged yet"}
            </p>
          </section>

          {canBuyerCancel(order) && (
            <Button
              variant="outline"
              className="w-full"
              loading={cancel.isPending}
              onClick={() => cancel.mutate()}
            >
              Cancel this order
            </Button>
          )}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">History</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {(order.statusHistory ?? []).map((entry, i) => (
            <li key={`${entry.status}-${i}`} className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
              <span className="font-medium">{entry.status}</span>
              <span className="text-ink-500">{formatDate(entry.at)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function OrderDetailPage({ params }) {
  const { id } = use(params);

  return (
    <RequireAuth>
      <OrderDetail id={id} />
    </RequireAuth>
  );
}