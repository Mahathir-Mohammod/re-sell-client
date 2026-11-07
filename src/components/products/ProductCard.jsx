import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { ConditionBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-ink-800 dark:bg-ink-900">
      <Link href={`/products/${product.slug || product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-ink-100">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-ink-400">No image</div>
        )}
        <div className="absolute left-3 top-3">
          <ConditionBadge condition={product.condition} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.slug || product._id}`}
          className="line-clamp-2 font-medium leading-snug hover:text-brand-700"
        >
          {product.title}
        </Link>

        <div className="mt-auto flex items-center gap-3 text-xs text-ink-500">
          {product.ratingCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-accent-500 text-accent-500" aria-hidden />
              {product.ratingAvg.toFixed(1)}
              <span className="text-ink-400">({product.ratingCount})</span>
            </span>
          )}
          {product.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{product.location}</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          <span className="text-xs text-ink-400">
            {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
      <div className="aspect-[4/3] animate-pulse bg-ink-100 dark:bg-ink-800" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
      </div>
    </div>
  );
}