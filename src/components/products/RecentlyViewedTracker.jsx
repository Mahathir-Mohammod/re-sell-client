"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/providers/RecentlyViewedProvider";

// Records the view after paint. A click on the page passes the already-fetched product
// so the tracker never triggers a second request.
export function RecentlyViewedTracker({ product }) {
  const { track } = useRecentlyViewed();

  useEffect(() => {
    if (!product) return;
    track(product);
  }, [product, track]);

  return null;
}
