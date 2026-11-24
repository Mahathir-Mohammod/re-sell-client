"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { STATUS_TONE } from "@/lib/orderStatus";

const paymentTone = (status) =>
  status === "paid" ? "brand" : status === "refunded" ? "neutral" : status === "failed" ? "red" : "amber";

const title = (order) => order.items?.map((i) => i.title).join(", ");
const units = (order) => order.items?.reduce((n, i) => n + i.quantity, 0) ?? 0;

// One component for seller and admin lists. Below `md` the table would need sideways
// scrolling to be readable, so the same rows render as stacked cards instead.
export function OrdersTable({ orders, party = "buyer", actions, linkTo }) {
  return (
    <>
      {/* desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink-200 md:block dark:border-ink-800">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-900">
            <tr>
              <th scope="col" className="px-4 py-3">Order</th>
              <th scope="col" className="px-4 py-3">{party === "buyer" ? "Buyer" : "Seller"}</th>
              <th scope="col" className="px-4 py-3">Placed</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Payment</th>
              <th scope="col" className="px-4 py-3 text-right">Total</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {orders.map((order) => {
              const person = party === "buyer" ? order.buyerInfo : order.sellerInfo;
              return (
                <tr key={order._id} className="align-top">
                  <td className="px-4 py-3">
                    {linkTo ? (
                      <Link href={linkTo(order)} className="font-medium hover:text-brand-700">
                        {title(order)}
                      </Link>
                    ) : (
                      <span className="font-medium">{title(order)}</span>
                    )}
                    <p className="mt-1 font-mono text-[11px] text-ink-400">
                      #{order._id.slice(-8)} · {units(order)} item(s)
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate">{person?.name ?? "—"}</p>
                    <p className="text-xs text-ink-500">{person?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">{actions?.(order)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* phones */}
      <ul className="space-y-3 md:hidden">
        {orders.map((order) => {
          const person = party === "buyer" ? order.buyerInfo : order.sellerInfo;
          return (
            <li key={order._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <div className="flex items-start justify-between gap-3">
                {linkTo ? (
                  <Link href={linkTo(order)} className="min-w-0 font-medium hover:text-brand-700">
                    <span className="line-clamp-2">{title(order)}</span>
                  </Link>
                ) : (
                  <span className="line-clamp-2 min-w-0 font-medium">{title(order)}</span>
                )}
                <span className="shrink-0 font-semibold tabular-nums">{formatPrice(order.total)}</span>
              </div>

              <p className="mt-1 truncate text-xs text-ink-500">
                {person?.name ?? "—"} · {formatDate(order.createdAt)} · {units(order)} item(s)
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone={STATUS_TONE[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
                <Badge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
              </div>

              {actions && <div className="mt-3 flex flex-wrap gap-2">{actions(order)}</div>}
            </li>
          );
        })}
      </ul>
    </>
  );
}