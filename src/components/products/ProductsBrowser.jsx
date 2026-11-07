"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { fetchProducts, productQuery } from "@/lib/api/products";
import { CONDITIONS, SORTS } from "@/lib/constants";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ProductsBrowser({ initialData, categories = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = productQuery(searchParams);
  const page = query.page;
  const filters = query;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query),
    initialData,
  });

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const activeFilters = ["search", "category", "condition", "minPrice", "maxPrice"].filter(
    (k) => filters[k]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("search", new FormData(e.currentTarget).get("search")?.trim());
          }}
          className="space-y-2"
        >
          <label htmlFor="search" className="text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="search"
              name="search"
              defaultValue={filters.search ?? ""}
              placeholder="e.g. laptop"
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900"
            />
          </div>
        </form>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <select
            id="category"
            value={filters.category ?? ""}
            onChange={(e) => setParam("category", e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="condition" className="text-sm font-medium">Condition</label>
          <select
            id="condition"
            value={filters.condition ?? ""}
            onChange={(e) => setParam("condition", e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <form
          onSubmit={(e) => {
            const form = new FormData(e.currentTarget);
            setParam("minPrice", form.get("minPrice"));
            setParam("maxPrice", form.get("maxPrice"));
          }}
          className="space-y-2"
        >
          <span className="text-sm font-medium">Price range</span>
          <div className="flex items-center gap-2">
            <input
              name="minPrice"
              type="number"
              min="0"
              defaultValue={filters.minPrice ?? ""}
              placeholder="Min"
              aria-label="Minimum price"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
            />
            <span aria-hidden className="text-ink-400">–</span>
            <input
              name="maxPrice"
              type="number"
              min="0"
              defaultValue={filters.maxPrice ?? ""}
              placeholder="Max"
              aria-label="Maximum price"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
            />
          </div>
          <button type="submit" className="text-sm font-medium text-brand-700 hover:underline">
            Apply range
          </button>
        </form>

        {activeFilters.length > 0 && (
          <button
            onClick={() => router.push(pathname)}
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
          >
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        )}
      </aside>

      <section className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500" role="status">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} items`}
            {filters.search && ` for “${filters.search}”`}
          </p>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Sort</span>
            <select
              value={filters.sort ?? "newest"}
              onChange={(e) => setParam("sort", e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {isError ? (
          <EmptyState
            title="Could not load products"
            description={error?.message ?? "The API did not respond. Is the server running?"}
          />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            title="No products match these filters"
            description="Try a different search term, widen the price range, or clear the filters."
            action={
              <ButtonLink href={pathname} variant="outline" size="sm" className="mt-4">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <ProductGrid products={data?.items} isLoading={isLoading} />
        )}

        {data?.meta && data.meta.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - page) < 3 || n === 1 || n === data.meta.totalPages)
              .map((n, i, arr) => (
                <span key={n} className="flex items-center gap-2">
                  {i > 0 && n - arr[i - 1] > 1 && <span className="text-ink-400">…</span>}
                  <button
                    onClick={() => setParam("page", String(n))}
                    aria-current={n === page ? "page" : undefined}
                    className={cn(
                      "size-9 rounded-xl text-sm font-medium",
                      n === page
                        ? "bg-brand-600 text-white"
                        : "border border-ink-200 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800"
                    )}
                  >
                    {n}
                  </button>
                </span>
              ))}
          </nav>
        )}
      </section>
    </div>
  );
}