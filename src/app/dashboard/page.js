"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PackagePlus, Store } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { becomeSeller } from "@/lib/api/products";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function DashboardOverview() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

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
        <p className="mt-1 text-ink-500">Here is what you can do next.</p>
      </div>

      {role === "buyer" && (
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

      {(role === "seller" || role === "admin") && (
        <section className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <PackagePlus className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">Sell an item</h2>
              <p className="mt-1 text-sm text-ink-500">
                Listings go live after a quick review.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/seller/add-product">Add product</ButtonLink>
            <ButtonLink href="/dashboard/seller/my-products" variant="outline">
              My products
            </ButtonLink>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
        <h2 className="font-semibold">Buying</h2>
        <p className="mt-1 text-sm text-ink-500">
          Orders and payments appear here once checkout is enabled.
        </p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
          Browse products →
        </Link>
      </section>

      {role === "buyer" && (
        <p className="text-xs text-ink-400">
          Seller tools unlock as soon as you upgrade.{" "}
          <Badge tone="neutral">you can do this once</Badge>
        </p>
      )}
    </div>
  );
}