"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProduct,
  fetchCategories,
  fetchMyProducts,
} from "@/lib/api/products";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProductForm } from "@/components/forms/ProductForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

const statusTone = { available: "brand", sold: "neutral", unavailable: "amber", pending: "amber", rejected: "red" };

function MyProducts() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => fetchMyProducts({ limit: 50 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Listing deleted");
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not delete"),
  });

  const items = data?.items ?? [];

  if (editing) {
    return (
      <div className="max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Edit listing</h1>
          <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
        </header>
        <ProductForm
          categories={categories}
          product={editing}
          onDone={() => {
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ["my-products"] });
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} listing(s)`}
          </p>
        </div>
        <ButtonLink href="/dashboard/seller/add-product" size="sm">
          <Plus className="size-4" aria-hidden /> Add product
        </ButtonLink>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Your products will show up here once you add them."
          action={<ButtonLink href="/dashboard/seller/add-product" className="mt-4">Add your first product</ButtonLink>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((product) => (
            <li
              key={product._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element -- seller-provided host */}
                {product.images?.[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/products/${product.slug}`} className="line-clamp-1 font-medium hover:text-brand-700">
                  {product.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                  <Badge tone={statusTone[product.status] ?? "neutral"}>{product.status}</Badge>
                  <Badge tone={product.moderationStatus === "approved" ? "brand" : product.moderationStatus === "rejected" ? "red" : "amber"}>
                    {product.moderationStatus}
                  </Badge>
                  <span>{formatPrice(product.price)}</span>
                  <span>{product.stock} in stock</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(product)}>
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </Button>
                {deletingId === product._id ? (
                  <>
                    <Button size="sm" variant="danger" loading={remove.isPending} onClick={() => remove.mutate(product._id)}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)}>
                      No
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setDeletingId(product._id)} aria-label={`Delete ${product.title}`}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MyProductsPage() {
  return (
    <RequireAuth roles={["seller", "admin"]}>
      <MyProducts />
    </RequireAuth>
  );
}