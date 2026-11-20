"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { cancelOrder, fetchMyOrders } from "@/lib/api/orders";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";
import { STATUS_TONE, canBuyerCancel } from "@/lib/orderStatus";

function BuyerOrders() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", status],
    queryFn: () => fetchMyOrders({ limit: 30, ...(status && { status }) }),
  });

  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not cancel"),
  });

  const orders = data?.items ?? [];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My orders</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} order(s)`}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            <option value="">All</option>
            {["pending", "accepted", "processing", "shipped", "delivered", "cancelled", "rejected"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Once you check out, your orders appear here."
          action={<ButtonLink href="/products" className="mt-4">Browse products</ButtonLink>}
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/orders/${order._id}`} className="font-medium hover:text-brand-700">
                    {order.items.map((i) => i.title).join(", ")}
                  </Link>
                  <p className="mt-1 text-xs text-ink-500">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s) ·{" "}
                    {order.sellerInfo?.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
                  <Badge tone={order.paymentStatus === "paid" ? "brand" : "amber"}>{order.paymentStatus}</Badge>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <ButtonLink href={`/dashboard/orders/${order._id}`} size="sm" variant="outline">
                  View details
                </ButtonLink>
                {canBuyerCancel(order) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={cancel.isPending && cancel.variables === order._id}
                    onClick={() => cancel.mutate(order._id)}
                  >
                    Cancel order
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BuyerOrdersPage() {
  return (
    <RequireAuth>
      <BuyerOrders />
    </RequireAuth>
  );
}