"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/api/admin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ACTION_LABEL, ORDER_STATUS, PAYMENT_STATUS, nextStatuses } from "@/lib/orderStatus";

const filter =
  "rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900";

function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", deferredSearch, status, paymentStatus],
    queryFn: () =>
      fetchAdminOrders({
        limit: 50,
        ...(deferredSearch && { search: deferredSearch }),
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      }),
  });

  const move = useMutation({
    mutationFn: ({ id, next }) => updateAdminOrderStatus(id, next),
    onSuccess: (_order, vars) => {
      toast.success(`Order moved to ${vars.next}`);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not change the status"),
  });

  const orders = data?.items ?? [];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All orders</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} order(s)`} · admins can move an order through
            any legal step
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyer, seller or transaction"
            aria-label="Search orders"
            className={`w-60 ${filter}`}
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
          title="No orders match"
          description="Clear the filters to see every order on the platform."
        />
      ) : (
        <OrdersTable
          orders={orders}
          party="buyer"
          actions={(order) =>
            nextStatuses(order).map((next) => (
              <Button
                key={next}
                size="sm"
                variant={next === "cancelled" || next === "rejected" ? "outline" : "primary"}
                loading={move.isPending && move.variables?.id === order._id}
                onClick={() => move.mutate({ id: order._id, next })}
              >
                {ACTION_LABEL[next] ?? next}
              </Button>
            ))
          }
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminOrders />
    </RequireAuth>
  );
}