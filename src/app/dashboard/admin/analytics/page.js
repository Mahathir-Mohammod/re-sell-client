"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, ShieldAlert, ShoppingBag, UserPlus, Users } from "lucide-react";
import { fetchAdminAnalytics, fetchAdminStats } from "@/lib/api/admin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  CategoryBarChart,
  OrdersBarChart,
  RevenueAreaChart,
  StatusLegendChart,
} from "@/components/dashboard/Charts";
import { formatPrice } from "@/lib/utils";

function AdminAnalytics() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const analytics = useQuery({ queryKey: ["admin-analytics"], queryFn: fetchAdminAnalytics });

  const s = stats.data;
  const a = analytics.data;
  const loading = stats.isLoading || analytics.isLoading;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Platform analytics</h1>
        <p className="mt-1 text-sm text-ink-500">
          Marketplace activity for the last six months. Revenue counts paid orders only.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Users" value={s?.users.total ?? 0} hint={`${s?.users.byRole.seller ?? 0} sellers`} icon={Users} loading={loading} />
        <StatCard label="Buyers" value={s?.users.byRole.buyer ?? 0} hint="accounts that can shop" icon={UserPlus} tone="neutral" loading={loading} />
        <StatCard label="Listings" value={s?.products.total ?? 0} icon={Package} tone="neutral" loading={loading} />
        <StatCard
          label="Awaiting review"
          value={s?.products.byModeration.pending ?? 0}
          hint="pending moderation"
          icon={ShieldAlert}
          tone="amber"
          loading={loading}
        />
        <StatCard label="Orders" value={s?.orders.total ?? 0} icon={ShoppingBag} tone="neutral" loading={loading} />
        <StatCard
          label="Net revenue"
          value={formatPrice(s?.revenue.net ?? 0)}
          hint={`${formatPrice(s?.revenue.refunded ?? 0)} refunded`}
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueAreaChart data={a.monthly} title="Revenue" description="Paid orders per month" />
          <OrdersBarChart data={a.monthly} title="Orders" description="Orders created per month" />
          <OrdersBarChart
            data={a.signups}
            title="New users"
            description="Signups per month"
            dataKey="signups"
            label="Signups"
          />
          <StatusLegendChart data={a.byStatus} title="Orders by status" description="Where orders sit right now" />
          <div className="lg:col-span-2">
            <CategoryBarChart data={a.topCategories} title="Listings by category" description="Top eight categories" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminAnalytics />
    </RequireAuth>
  );
}