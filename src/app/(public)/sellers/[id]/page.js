import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Package, Star } from "lucide-react";
import { fetchPublicSeller } from "@/lib/api/stats";
import { ProductGrid } from "@/components/products/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await fetchPublicSeller(id);
  if (!data) return { title: "Seller not found" };
  return {
    title: data.seller.name,
    description: `Listings from ${data.seller.name} on ReSell Hub.`,
  };
}

export default async function SellerProfilePage({ params }) {
  const { id } = await params;
  const data = await fetchPublicSeller(id);
  if (!data) notFound();

  const { seller, listings, stats } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brand-700">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700 dark:text-ink-200">{seller.name}</span>
      </nav>

      <header className="rounded-2xl border border-ink-200 p-6 dark:border-ink-800">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 text-xl font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {seller.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied avatar host
              <img src={seller.image} alt="" className="size-full object-cover" />
            ) : (
              seller.name?.slice(0, 1)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
              {seller.name}
              {seller.isVerified && <VerifiedBadge />}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
              {seller.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden /> {seller.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" aria-hidden /> Joined {formatDate(seller.joinedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-accent-500 text-accent-500" aria-hidden />
                {stats.ratingCount > 0 ? `${stats.ratingAvg.toFixed(1)} (${stats.ratingCount} reviews)` : "No reviews yet"}
              </span>
            </div>

            {seller.bio && <p className="mt-3 max-w-2xl text-sm text-ink-600 dark:text-ink-300">{seller.bio}</p>}
          </div>

          <dl className="flex gap-6 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">Listings</dt>
              <dd className="text-xl font-bold tabular-nums">{stats.listings}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">Sold</dt>
              <dd className="text-xl font-bold tabular-nums">{stats.completedOrders}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Package className="size-4 text-ink-400" aria-hidden /> Listings
        </h2>

        {listings.length ? (
          <ProductGrid products={listings} />
        ) : (
          <EmptyState
            title="No live listings"
            description={`${seller.name} has nothing available right now.`}
          />
        )}
      </section>
    </div>
  );
}