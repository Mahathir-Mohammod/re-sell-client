"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "resell-cart";
// localStorage is an external store, so React reads it through useSyncExternalStore:
// no hydration mismatch, no setState-in-effect, and free cross-tab sync.
const EMPTY = [];
const listeners = new Set();
let cachedRaw = null;
let cachedItems = EMPTY;

function parse(raw) {
  try {
    const value = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  // identical raw string -> identical array reference, so React doesn't re-render
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

function getServerSnapshot() {
  return EMPTY;
}

// hydration never changes after it happens, so there is nothing to subscribe to
const noopSubscribe = () => () => {};

// React only calls this getter on the client, so "it ran" means "we are hydrated".
const trueOnClient = () => true;
const falseOnServer = () => false;

function subscribe(onChange) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // changes from another tab
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeItems(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // localStorage is invisible to the server, so consumers must not render saved items
  // before hydration. Without this the cart page could never leave its skeleton:
  // `hydrated` stayed undefined because nothing ever set it.
  const hydrated = useSyncExternalStore(noopSubscribe, trueOnClient, falseOnServer);

  const update = useCallback((next) => writeItems(next(items)), [items]);

  const addItem = useCallback(
    (product, quantity = 1) =>
      update((current) => {
        const existing = current.find((i) => i.productId === product._id);
        if (existing) {
          return current.map((i) =>
            i.productId === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
              : i
          );
        }
        return [
          ...current,
          {
            productId: product._id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            image: product.images?.[0] ?? null,
            stock: product.stock,
            sellerId: product.sellerInfo?.userId ?? null,
            sellerName: product.sellerInfo?.name ?? "",
            quantity: Math.min(quantity, product.stock),
          },
        ];
      }),
    [update]
  );

  const setQuantity = useCallback(
    (productId, quantity) =>
      update((current) =>
        current
          .map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
              : i
          )
          .filter((i) => i.quantity > 0)
      ),
    [update]
  );

  const removeItem = useCallback(
    (productId) => update((current) => current.filter((i) => i.productId !== productId)),
    [update]
  );

  const clearCart = useCallback(() => writeItems([]), []);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, hydrated, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}