import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/products/ProductGrid";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getJson(path) {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return (await res.json()).data;
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getJson("/api/products/featured?limit=8"),
    getJson("/api/categories"),
  ]);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Handpicked</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Featured listings</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            See all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {featured.length ? (
          <ProductGrid products={featured} />
        ) : (
          <p className="rounded-2xl border border-dashed border-ink-200 py-12 text-center text-sm text-ink-500 dark:border-ink-800">
            No featured listings yet — run <code className="font-mono">npm run seed</code> in the server.
          </p>
        )}
      </section>

      <section className="border-y border-ink-200 bg-ink-50/60 py-14 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Explore</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Popular categories</h2>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              All categories <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200 transition-shadow hover:shadow-md dark:bg-ink-900 dark:ring-ink-800"
              >
                <div className="relative aspect-[4/3]">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium">{category.name}</h3>
                  <p className="text-xs text-ink-500">{category.productCount} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}