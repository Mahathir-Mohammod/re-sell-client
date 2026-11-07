import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const metadata = {
  title: "Categories",
  description: "Browse second-hand products by category.",
};

async function getCategories() {
  const res = await fetch(`${API}/api/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Categories API responded ${res.status}`);
  return (await res.json()).data;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-ink-500">Find what you need, one shelf at a time.</p>
      </header>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
          >
            <div className="relative aspect-[4/3] bg-ink-100 dark:bg-ink-800">
              {category.image && (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <h2 className="font-medium">{category.name}</h2>
                <p className="text-xs text-ink-500">{category.productCount} items</p>
              </div>
              <ArrowRight className="size-4 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}