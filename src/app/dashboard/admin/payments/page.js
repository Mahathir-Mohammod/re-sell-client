"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Receipt, RotateCcw, Wallet } from "lucide-react";
import { fetchAdminPayments } from "@/lib/api/admin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PAYMENT_STATUS } from "@/lib/orderStatus";
import { formatDate, formatPrice } from "@/lib/utils";

const filter =
  "rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900";

const tone = (status) =>
  status === "paid" ? "brand" : status === "refunded" ? "neutral" : status === "failed" ? "red" : "amber";

function AdminPayments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", deferredSearch, status],
    queryFn: () =>
      fetchAdminPayments({
        limit: 50,
        ...(deferredSearch && { search: deferredSearch }),
        ...(status && { status }),
      }),
  });

  const payments = data?.items ?? [];
  const summary = data?.meta?.summary;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} transaction(s)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Transaction id or buyer id"
            aria-label="Search payments"
            className={`w-60 ${filter}`}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={filter}>
            <option value="">Any status</option>
            {PAYMENT_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Transactions" value={summary?.count ?? 0} icon={Receipt} loading={isLoading} />
        <StatCard label="Gross volume" value={formatPrice(summary?.gross ?? 0)} icon={Wallet} loading={isLoading} />
        <StatCard label="Refunded" value={formatPrice(summary?.refunded ?? 0)} icon={RotateCcw} tone="amber" loading={isLoading} />
        <StatCard label="Net revenue" value={formatPrice(summary?.net ?? 0)} icon={CreditCard} loading={isLoading} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments match"
          description="Payments recorded by Stripe (webhook or confirm fallback) land here."
        />
      ) : (
        <div className="hidden overflow-x-auto rounded-2xl border border-ink-200 md:block dark:border-ink-800">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-900">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Transaction</th>
                <th scope="col" className="px-4 py-3">Buyer</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3 text-right">Refunded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{payment.transactionId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{payment.buyerId ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone(payment.status)}>{payment.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(payment.amount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {payment.refundedAmount ? formatPrice(payment.refundedAmount) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <ul className="space-y-3 md:hidden">
          {payments.map((payment) => (
            <li key={payment._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs break-all">{payment.transactionId}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-ink-400">{payment.buyerId ?? "—"}</p>
                  <p className="mt-1 text-xs text-ink-500">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{formatPrice(payment.amount)}</p>
                  {payment.refundedAmount ? (
                    <p className="text-xs text-ink-500">-{formatPrice(payment.refundedAmount)}</p>
                  ) : null}
                </div>
              </div>
              <Badge tone={tone(payment.status)} className="mt-2">
                {payment.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminPayments />
    </RequireAuth>
  );
}