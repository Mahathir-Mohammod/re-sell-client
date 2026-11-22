"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3,
  DollarSign,
  PackagePlus,
  ShieldAlert,
  ShoppingBag,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { becomeSeller } from "@/lib/api/products";
import { fetchMyOrders, fetchMyPayments } from "@/lib/api/orders";
import { fetchSellerStats } from "@/lib/api/seller";
import { fetchAdminStats } from "@/lib/api/admin";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatPrice } from "@/lib/utils";

export default function DashboardOverview() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const isBuyer = role === "buyer";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";

  const buyerOrders = useQuery({
    queryKey: ["my-orders", "summary"],
    queryFn: () => fetchMyOrders({ limit: 1 }),
    enabled: isBuyer,
  });
  const buyerPayments = useQuery({
    queryKey: ["my-payments", "summary"],
    queryFn: () => fetchMyPayments({ limit: 1 }),
    enabled: isBuyer,
  });
  const sellerStats = useQuery({
    queryKey: ["seller-stats"],
    queryFn: fetchSellerStats,
    enabled: isSeller,
  });
  const adminStats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: isAdmin,
  });

  const upgrade = useMutation({
    mutationFn: becomeSeller,
    onSuccess: () => {
      toast.success("You are a seller now — add your first listing");
      // the role lives in the session record; refetch so the sidebar updates
      queryClient.invalidateQueries();
      window.location.reload();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not upgrade"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-ink-500">
          {isAdmin
            ? "Everything happening on the marketplace, at a glance."
            : isSeller
              ? "Your listings, orders and earnings at a glance."
              : "Your orders and payments at a glance."}
        </p>
      </div>

      {isBuyer && (
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Orders"
            value={buyerOrders.data?.meta.total ?? 0}
            hint="all time"
            icon={ShoppingBag}
            loading={buyerOrders.isLoading}
          />
          <StatCard
            label="Payments"
            value={buyerPayments.data?.meta.total ?? 0}
            hint="completed checkouts"
            icon={DollarSign}
            tone="neutral"
            loading={buyerPayments.isLoading}
          />
        </div>
      )}

      {isSeller && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatPrice(sellerStats.data?.revenue ?? 0)}
              icon={DollarSign}
              loading={sellerStats.isLoading}
            />
            <StatCard
              label="Units sold"
              value={sellerStats.data?.unitsSold ?? 0}
              icon={ShoppingBag}
              tone="neutral"
              loading={sellerStats.isLoading}
            />
            <StatCard
              label="Live listings"
              value={sellerStats.data?.liveListings ?? 0}
              hint={`${sellerStats.data?.totalProducts ?? 0} total`}
              icon={PackagePlus}
              tone="neutral"
              loading={sellerStats.isLoading}
            />
            <StatCard
              label="In review"
              value={sellerStats.data?.pendingReview ?? 0}
              hint="waiting on an admin"
              icon={ShieldAlert}
              tone="amber"
              loading={sellerStats.isLoading}
            />
          </div>

          {sellerStats.data?.pendingOrders > 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {sellerStats.data.pendingOrders} order(s) need your action.{" "}
              <Link href="/dashboard/seller/manage-orders" className="font-medium underline">
                Review now
              </Link>
            </p>
          )}
        </>
      )}

      {isAdmin && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Users"
            value={adminStats.data?.users.total ?? 0}
            hint={`${adminStats.data?.users.byRole.seller ?? 0} sellers`}
            icon={Users}
            loading={adminStats.isLoading}
          />
          <StatCard
            label="Listings"
            value={adminStats.data?.products.total ?? 0}
            icon={ShoppingBag}
            tone="neutral"
            loading={adminStats.isLoading}
          />
          <StatCard
            label="Awaiting review"
            value={adminStats.data?.products.byModeration.pending ?? 0}
            hint="moderation queue"
            icon={ShieldAlert}
            tone="amber"
            loading={adminStats.isLoading}
          />
          <StatCard
            label="Net revenue"
            value={formatPrice(adminStats.data?.revenue.net ?? 0)}
            icon={DollarSign}
            loading={adminStats.isLoading}
          />
        </div>
      )}

      {isBuyer && (
        <section className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <Store className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">Start selling</h2>
              <p className="mt-1 text-sm text-ink-500">
                Turn your account into a seller account and list your first item.
              </p>
            </div>
          </div>
          <Button className="mt-4" loading={upgrade.isPending} onClick={() => upgrade.mutate()}>
            Become a seller
          </Button>
        </section>
      )}

      {(isSeller || isAdmin) && (
        <section className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <PackagePlus className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">Sell an item</h2>
              <p className="mt-1 text-sm text-ink-500">Listings go live after a quick review.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/seller/add-product">Add product</ButtonLink>
            <ButtonLink href="/dashboard/seller/my-products" variant="outline">
              My listings
            </ButtonLink>
          </div>
        </section>
      )}

      {isSeller && (
        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/seller/manage-orders"
            className="flex items-start gap-3 rounded-2xl border border-ink-200 p-4 hover:border-brand-400 dark:border-ink-800"
          >
            <Truck className="mt-0.5 size-5 text-brand-700 dark:text-brand-300" aria-hidden />
            <span>
              <span className="block font-medium">Manage orders</span>
              <span className="mt-0.5 block text-sm text-ink-500">Accept, ship and deliver by hand.</span>
            </span>
          </Link>
          <Link
            href="/dashboard/seller/analytics"
            className="flex items-start gap-3 rounded-2xl border border-ink-200 p-4 hover:border-brand-400 dark:border-ink-800"
          >
            <BarChart3 className="mt-0.5 size-5 text-brand-700 dark:text-brand-300" aria-hidden />
            <span>
              <span className="block font-medium">Sales analytics</span>
              <span className="mt-0.5 block text-sm text-ink-500">Revenue, units and best performers.</span>
            </span>
          </Link>
        </section>
      )}

      {isAdmin && (
        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/products"
            className="flex items-start gap-3 rounded-2xl border border-ink-200 p-4 hover:border-brand-400 dark:border-ink-800"
          >
            <ShieldAlert className="mt-0.5 size-5 text-brand-700 dark:text-brand-300" aria-hidden />
            <span>
              <span className="block font-medium">Moderation queue</span>
              <span className="mt-0.5 block text-sm text-ink-500">Approve or reject new seller listings.</span>
            </span>
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-start gap-3 rounded-2xl border border-ink-200 p-4 hover:border-brand-400 dark:border-ink-800"
          >
            <ShoppingBag className="mt-0.5 size-5 text-brand-700 dark:text-brand-300" aria-hidden />
            <span>
              <span className="block font-medium">Your own purchases</span>
              <span className="mt-0.5 block text-sm text-ink-500">Admins can buy and sell too.</span>
            </span>
          </Link>
        </section>
      )}

      <section className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
        <h2 className="font-semibold">Buying</h2>
        <p className="mt-1 text-sm text-ink-500">Orders and payments are listed under your dashboard.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/orders" variant="outline" size="sm">
            My orders
          </ButtonLink>
          <ButtonLink href="/dashboard/payments" variant="outline" size="sm">
            Payment history
          </ButtonLink>
          <Link href="/products" className="mt-1 text-sm font-medium text-brand-700 hover:underline">
            Browse products →
          </Link>
        </div>
      </section>

      {isBuyer && (
        <p className="text-xs text-ink-400">
          Seller tools unlock as soon as you upgrade. <Badge tone="neutral">you can do this once</Badge>
        </p>
      )}
    </div>
  );
}