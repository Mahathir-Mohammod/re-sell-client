import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export function TrustedSellers({ sellers = [] }) {
  if (!sellers.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Trusted sellers</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">People with a track record</h2>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
          Browse their listings <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.slice(0, 6).map((seller) => (
          <li key={seller._id}>
            <Link
              href={`/sellers/${seller._id}`}
              className="flex h-full items-start gap-3 rounded-2xl border border-ink-200 p-5 transition-colors hover:border-brand-400 dark:border-ink-800"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-brand-50 dark:bg-brand-900/40">
                {seller.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user-supplied avatar host
                  <img src={seller.image} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center font-semibold text-brand-700 dark:text-brand-200">
                    {seller.name?.slice(0, 1)}
                  </span>
                )}
              </span>

              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{seller.name}</span>
                  {seller.isVerified && <VerifiedBadge label="Verified" />}
                </p>
                {seller.location && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="size-3" aria-hidden /> {seller.location}
                  </p>
                )}
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-ink-600 dark:text-ink-300">
                  {seller.ratingCount > 0 ? (
                    <>
                      <Star className="size-3.5 fill-accent-500 text-accent-500" aria-hidden />
                      {seller.ratingAvg.toFixed(1)} ({seller.ratingCount})
                    </>
                  ) : (
                    <span className="text-ink-400">No reviews yet</span>
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="border-t border-ink-200 bg-ink-900 py-16 dark:border-ink-800">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Got something you no longer use?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-300">
          List it in a couple of minutes. Someone nearby is probably looking for exactly that.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
          >
            Start selling
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center rounded-xl border border-ink-700 px-6 font-semibold text-white hover:bg-ink-800"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}
