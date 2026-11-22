"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { fetchSellerOrders, updateSellerOrderStatus } from "@/lib/api/seller";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACTION_LABEL, ORDER_STATUS, PAYMENT_STATUS, sellerNextStatuses } from "@/lib/orderStatus";

const filter =
  "rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900";

function ManageOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [confirming, setConfirming] = useState(null);
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", deferredSearch, status, paymentStatus],
    queryFn: () =>
      fetchSellerOrders({
        limit: 50,
        ...(deferredSearch && { search: deferredSearch }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      }),
  });

  const move = useMutation({
    mutationFn: ({ id, next }) => updateSellerOrderStatus(id, next),
    onSuccess: (order, vars) => {
      toast.success(vars.next === "rejected" ? "Order rejected and refunded" : `Order moved to ${order.orderStatus}`);
      setConfirming(null);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-stats"] });
      queryClient.invalidateQueries({ queryKey: ["seller-analytics"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not change the status"),
  });

  const orders = data?.items ?? [];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage orders</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} incoming order(s)`} · accept, process, ship and
            deliver
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyer or item"
            aria-label="Search orders"
            className={`w-48 ${filter}`}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={filter}>
            <option value="">Any status</option>
            {ORDER_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            aria-label="Filter by payment"
            className={filter}
          >
            <option value="">Any payment</option>
            {PAYMENT_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="When a buyer checks out one of your listings, the order appears here."
        />
      ) : (
        <OrdersTable
          orders={orders}
          party="buyer"
          actions={(order) =>
            sellerNextStatuses(order).map((next) => {
              const busy = move.isPending && move.variables?.id === order._id;
              // rejecting a paid order triggers a refund, so ask first
              if (next === "rejected") {
                return confirming === order._id ? (
                  <Button
                    key={next}
                    size="sm"
                    variant="danger"
                    loading={busy}
                    onClick={() => move.mutate({ id: order._id, next })}
                  >
                    Confirm reject
                  </Button>
                ) : (
                  <Button
                    key={next}
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirming(order._id)}
                  >
                    Reject
                  </Button>
                );
              }
              return (
                <Button
                  key={next}
                  size="sm"
                  loading={busy}
                  onClick={() => move.mutate({ id: order._id, next })}
                >
                  {ACTION_LABEL[next] ?? next}
                </Button>
              );
            })
          }
        />
      )}

      {confirming && (
        <p className="mt-3 text-xs text-ink-500">
          Rejecting a paid order refunds the buyer automatically and restores stock.{" "}
          <button type="button" className="font-medium text-brand-700 underline" onClick={() => setConfirming(null)}>
            Cancel
          </button>
        </p>
      )}
    </div>
  );
}

export default function ManageOrdersPage() {
  return (
    <RequireAuth roles={["seller", "admin"]}>
      <ManageOrders />
    </RequireAuth>
  );
}