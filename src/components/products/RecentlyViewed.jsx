"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useRecentlyViewed } from "@/providers/RecentlyViewedProvider";
import { formatPrice } from "@/lib/utils";

export function RecentlyViewed({ excludeId, className }) {
  const { items } = useRecentlyViewed();
  const visible = items.filter((item) => item._id !== excludeId).slice(0, 6);

  // nothing to show on a first visit, and an empty section is worse than none
  if (visible.length === 0) return null;

  return (
    <section className={className} aria-labelledby="recently-viewed-heading">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="size-4 text-ink-400" aria-hidden />
        <h2 id="recently-viewed-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-500">
          Recently viewed
        </h2>
      </div>

      <ul className="flex gap-3 overflow-x-auto pb-2">
        {visible.map((item) => (
          <li key={item._id} className="w-40 shrink-0">
            <Link
              href={`/products/${item.slug}`}
              className="group block overflow-hidden rounded-xl border border-ink-200 hover:border-brand-400 dark:border-ink-800"
            >
              <div className="relative aspect-[4/3] bg-ink-100 dark:bg-ink-800">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-ink-400">No image</div>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-xs font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">{formatPrice(item.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
