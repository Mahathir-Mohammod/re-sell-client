"use client";

import { useQuery } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { fetchMyPayments } from "@/lib/api/orders";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate, formatPrice } from "@/lib/utils";

function PaymentHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => fetchMyPayments({ limit: 50 }),
  });

  const payments = data?.items ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payment history</h1>
        <p className="mt-1 text-sm text-ink-500">
          {isLoading ? "Loading…" : `${data?.meta.total ?? 0} transaction(s)`}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet"
          description="Completed checkouts show up here with their transaction id."
          action={<ButtonLink href="/products" className="mt-4">Browse products</ButtonLink>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-900">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Transaction</th>
                <th scope="col" className="px-4 py-3">Method</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{payment.transactionId}</td>
                  <td className="px-4 py-3">
                    {payment.method}
                    {payment.last4 ? ` ···· ${payment.last4}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={payment.status === "paid" ? "brand" : payment.status === "failed" ? "red" : "amber"}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <RequireAuth>
      <PaymentHistory />
    </RequireAuth>
  );
}