"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function CartButton() {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} item(s)` : "Cart"}
      className="relative grid size-9 place-items-center rounded-xl text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
    >
      <ShoppingBag className="size-5" aria-hidden />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}