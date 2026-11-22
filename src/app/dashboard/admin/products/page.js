"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, PackageSearch, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminProduct,
  fetchAdminProducts,
  moderateProduct,
} from "@/lib/api/admin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatPrice } from "@/lib/utils";

const TABS = [
  { value: "pending", label: "Awaiting review" },
  { value: "approved", label: "Live" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

const moderationTone = { approved: "brand", rejected: "red", pending: "amber" };

function ModerationQueue() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(null);
  // keeps typing responsive while the list refetches
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", tab, deferredSearch],
    queryFn: () =>
      fetchAdminProducts({
        limit: 50,
        ...(tab && { moderationStatus: tab }),
        ...(deferredSearch && { search: deferredSearch }),
      }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    // approving changes what buyers can see
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const moderate = useMutation({
    mutationFn: ({ id, moderationStatus, note }) => moderateProduct(id, { moderationStatus, reason: note || undefined }),
    onSuccess: (product) => {
      toast.success(product.moderationStatus === "approved" ? "Listing approved" : "Listing rejected");
      setRejecting(null);
      setReason("");
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not update the listing"),
  });

  const remove = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      toast.success("Listing deleted");
      setDeleting(null);
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not delete the listing"),
  });

  const items = data?.items ?? [];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} listing(s)`} · seller listings only appear in
            search once approved
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Search listings</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or seller"
            className="w-56 rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900"
          />
        </label>
      </header>

      <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="Moderation status">
        {TABS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-xl px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={tab === "pending" ? "Nothing waiting for review" : "No listings here"}
          description={
            tab === "pending"
              ? "New seller listings land here before they go live."
              : "Try another tab or clear the search."
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((product) => (
            <li key={product._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <div className="flex flex-wrap items-start gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                  {product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- seller-provided host
                    <img src={product.images[0]} alt="" className="size-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="line-clamp-1 font-medium hover:text-brand-700"
                  >
                    {product.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-500">
                    {product.sellerInfo?.name} · {product.sellerInfo?.email} · {formatDate(product.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                    <Badge tone={moderationTone[product.moderationStatus] ?? "neutral"}>
                      {product.moderationStatus}
                    </Badge>
                    <Badge tone={product.status === "available" ? "brand" : "neutral"}>{product.status}</Badge>
                    <span>{formatPrice(product.price)}</span>
                    <span>{product.stock} in stock</span>
                    <span className="capitalize">{product.category}</span>
                  </div>
                  {product.moderationReason && (
                    <p className="mt-2 rounded-lg bg-ink-50 px-2 py-1 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      Reason: {product.moderationReason}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.moderationStatus !== "approved" && (
                    <Button
                      size="sm"
                      loading={moderate.isPending && moderate.variables?.id === product._id}
                      onClick={() => moderate.mutate({ id: product._id, moderationStatus: "approved" })}
                    >
                      <Check className="size-3.5" aria-hidden /> Approve
                    </Button>
                  )}
                  {product.moderationStatus !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejecting(rejecting === product._id ? null : product._id);
                        setReason("");
                      }}
                    >
                      <X className="size-3.5" aria-hidden /> Reject
                    </Button>
                  )}
                  {deleting === product._id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={remove.isPending}
                        onClick={() => remove.mutate(product._id)}
                      >
                        Confirm delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${product.title}`}
                      onClick={() => setDeleting(product._id)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  )}
                </div>
              </div>

              {rejecting === product._id && (
                <form
                  className="mt-3 flex flex-wrap items-end gap-2 border-t border-ink-100 pt-3 dark:border-ink-800"
                  onSubmit={(event) => {
                    event.preventDefault();
                    moderate.mutate({ id: product._id, moderationStatus: "rejected", note: reason });
                  }}
                >
                  <label className="flex-1 text-sm">
                    <span className="mb-1 block text-xs font-medium text-ink-500">
                      Reason shown to the seller (optional)
                    </span>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={300}
                      placeholder="e.g. photos do not match the item"
                      className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900"
                    />
                  </label>
                  <Button type="submit" size="sm" variant="danger" loading={moderate.isPending}>
                    Reject listing
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <ModerationQueue />
    </RequireAuth>
  );
}