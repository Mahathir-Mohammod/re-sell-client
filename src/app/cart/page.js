"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, count, hydrated, setQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Your cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Items you add will wait here until you check out."
          action={<ButtonLink href="/products" className="mt-4">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Your cart <span className="text-ink-400">({count})</span>
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear cart
        </Button>
      </header>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element -- mixed seller hosts
                <img src={item.image} alt="" className="size-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.slug}`} className="line-clamp-1 font-medium hover:text-brand-700">
                {item.title}
              </Link>
              <p className="text-sm text-ink-500">
                {formatPrice(item.price)} · sold by {item.sellerName || "seller"}
              </p>
            </div>

            <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${item.title}`}>
              <button
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="grid size-8 place-items-center rounded-lg border border-ink-200 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800"
              >
                <Minus className="size-3.5" aria-hidden />
              </button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                {item.quantity}
              </span>
              <button
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label="Increase quantity"
                className="grid size-8 place-items-center rounded-lg border border-ink-200 hover:bg-ink-100 disabled:opacity-40 dark:border-ink-700 dark:hover:bg-ink-800"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </div>

            <p className="w-20 text-right font-semibold">{formatPrice(item.price * item.quantity)}</p>

            <button
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.title}`}
              className="text-ink-400 hover:text-red-600"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-6 rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-ink-500">
          <span>Delivery</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ink-200 pt-3 text-lg font-semibold dark:border-ink-800">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <Button className="mt-4 w-full" size="lg" onClick={() => router.push("/checkout")}>
          Continue to checkout
        </Button>
      </section>
    </div>
  );
}