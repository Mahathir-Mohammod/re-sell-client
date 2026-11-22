"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/providers/AuthProvider";

const EMPTY = new Set();

// One cached request feeds every heart on the page: any card can ask "is this saved?"
// without firing its own query.
export function useWishlistIds() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => fetchWishlist({ limit: 50 }),
    enabled: isAuthenticated,
    select: (result) => new Set(result.items.map((product) => product._id)),
  });

  return data ?? EMPTY;
}
