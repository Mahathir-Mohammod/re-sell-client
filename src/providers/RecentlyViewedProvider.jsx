"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const RecentContext = createContext(null);
const STORAGE_KEY = "resell-recently-viewed";
const MAX = 8;

// Same external-store pattern as the cart: writes are the only time the snapshot
// changes, so no setState-in-effect and no hydration mismatch.
const EMPTY = [];
const listeners = new Set();
let cachedRaw = null;
let cachedItems = EMPTY;

function parse(raw) {
  try {
    const value = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value.slice(0, MAX) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

const getServerSnapshot = () => EMPTY;

function subscribe(onChange) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeItems(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

export function RecentlyViewedProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Newest first, no duplicates, capped — cheap enough to run on every view.
  const track = useCallback((product) => {
    if (!product?._id) return;
    const entry = {
      _id: product._id,
      slug: product.slug ?? product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ?? null,
      condition: product.condition,
      location: product.location ?? "",
      viewedAt: new Date().toISOString(),
    };
    const current = parse(window.localStorage.getItem(STORAGE_KEY));
    writeItems([entry, ...current.filter((item) => item._id !== product._id)].slice(0, MAX));
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const value = useMemo(() => ({ items, track, clear }), [items, track, clear]);

  return <RecentContext value={value}>{children}</RecentContext>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside <RecentlyViewedProvider>");
  return ctx;
}