"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { fetchWishlist } from "@/lib/api/wishlist";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => fetchWishlist({ limit: 50 }),
  });

  const items = data?.items ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="mt-1 text-sm text-ink-500">
          {isLoading ? "Loading…" : `${data?.meta.total ?? 0} saved item(s)`} · tap the heart on a card to remove it
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any listing to keep it here for later."
          action={
            <ButtonLink href="/products" className="mt-4">
              Browse products
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <Wishlist />
    </RequireAuth>
  );
}