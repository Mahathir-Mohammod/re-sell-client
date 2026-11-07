import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MapPin, ShieldCheck, Star } from "lucide-react";
import { ImageGallery } from "@/components/products/ImageGallery";
import { ConditionBadge, Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(id) {
  const res = await fetch(`${API}/api/products/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Product API responded ${res.status}`);
  return (await res.json()).data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 150),
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-brand-700">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700 dark:text-ink-200">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} title={product.title} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={product.condition} />
            {product.isFeatured && <Badge tone="amber">Featured</Badge>}
            {product.stock === 0 && <Badge tone="red">Sold out</Badge>}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">{product.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            {product.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-accent-500 text-accent-500" aria-hidden />
                {product.ratingAvg.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Eye className="size-4" aria-hidden /> {product.views} views
            </span>
            {product.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden /> {product.location}
              </span>
            )}
          </div>

          <p className="mt-6 text-3xl font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-1 text-sm text-ink-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/login" size="lg" className={product.stock === 0 ? "pointer-events-none opacity-50" : ""}>
              Add to cart
            </ButtonLink>
            <ButtonLink href="/products" variant="outline" size="lg">
              Keep browsing
            </ButtonLink>
          </div>

          <section className="mt-8 rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Seller</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {product.sellerInfo?.name?.slice(0, 1) ?? "?"}
              </span>
              <div>
                <p className="font-medium">{product.sellerInfo?.name}</p>
                <p className="text-sm text-ink-500">{product.sellerInfo?.email}</p>
              </div>
              <ShieldCheck className="ml-auto size-5 text-brand-600" aria-label="Seller verified" />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-200">
              {product.description}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}