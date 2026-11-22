"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Boxes, DollarSign, Package, ShoppingBag, Timer, TrendingUp } from "lucide-react";
import { fetchSellerAnalytics, fetchSellerStats } from "@/lib/api/seller";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrdersBarChart, RevenueAreaChart, StatusLegendChart } from "@/components/dashboard/Charts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

function SellerAnalytics() {
  const stats = useQuery({ queryKey: ["seller-stats"], queryFn: fetchSellerStats });
  const analytics = useQuery({ queryKey: ["seller-analytics"], queryFn: fetchSellerAnalytics });

  const s = stats.data;
  const a = analytics.data;
  const loading = stats.isLoading || analytics.isLoading;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Sales analytics</h1>
        <p className="mt-1 text-sm text-ink-500">
          Revenue and volume for the last six months, from paid orders only.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue"
          value={formatPrice(s?.revenue ?? 0)}
          hint={`${formatPrice(s?.averageOrderValue ?? 0)} average order`}
          icon={DollarSign}
          loading={loading}
        />
        <StatCard label="Units sold" value={s?.unitsSold ?? 0} icon={Boxes} tone="neutral" loading={loading} />
        <StatCard label="Orders" value={s?.orders ?? 0} hint={`${s?.pendingOrders ?? 0} awaiting action`} icon={ShoppingBag} tone="neutral" loading={loading} />
        <StatCard label="Listings" value={s?.totalProducts ?? 0} hint={`${s?.liveListings ?? 0} live`} icon={Package} tone="neutral" loading={loading} />
        <StatCard label="In review" value={s?.pendingReview ?? 0} hint="waiting on an admin" icon={Timer} tone="amber" loading={loading} />
        <StatCard
          label="Conversion"
          value={s?.totalProducts ? `${Math.round(((s.liveListings ?? 0) / s.totalProducts) * 100)}%` : "—"}
          hint="live listings / all listings"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueAreaChart data={a.monthly} title="Revenue" description="Paid orders per month" />
            <OrdersBarChart data={a.monthly} title="Orders" description="Orders placed per month" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StatusLegendChart data={a.byStatus} title="Your orders by status" description="Live pipeline" />

            <section className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <h2 className="font-semibold">Best sellers</h2>
              <p className="mt-0.5 text-xs text-ink-500">Ranked by units sold</p>
              {a.topProducts.length === 0 ? (
                <EmptyState
                  title="No sales yet"
                  description="Once an order is paid, your best performers show up here."
                  action={<ButtonLink href="/dashboard/seller/add-product" size="sm" className="mt-4">Add a listing</ButtonLink>}
                />
              ) : (
                <ol className="mt-3 space-y-2">
                  {a.topProducts.map((product, index) => (
                    <li key={product.productId} className="flex items-center gap-3 text-sm">
                      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-semibold dark:bg-ink-800">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        <Link href={`/dashboard/seller/my-products`} className="hover:text-brand-700">
                          {product.title}
                        </Link>
                      </span>
                      <span className="text-xs text-ink-500">{product.units} sold</span>
                      <span className="w-16 text-right font-medium tabular-nums">{formatPrice(product.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerAnalyticsPage() {
  return (
    <RequireAuth roles={["seller", "admin"]}>
      <SellerAnalytics />
    </RequireAuth>
  );
}