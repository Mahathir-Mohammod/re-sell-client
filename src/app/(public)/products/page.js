import { Suspense } from "react";
import { ProductsBrowser } from "@/components/products/ProductsBrowser";
import { ProductGrid } from "@/components/products/ProductGrid";
import { fetchCategories, fetchProducts, productQuery } from "@/lib/api/products";

export const metadata = {
  title: "Browse second-hand products",
  description: "Search and filter second-hand electronics, furniture, vehicles and more.",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  // Prefetch so the first page is server-rendered (SEO + no loading flash);
  // filter changes from here on are client-side.
  const [initial, categories] = await Promise.all([
    fetchProducts(productQuery(params)),
    fetchCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse products</h1>
        <p className="mt-1 text-ink-500">
          Everything here has been used before and still has plenty of life left.
        </p>
      </header>

      <Suspense fallback={<ProductGrid isLoading />}>
        <ProductsBrowser initialData={initial} categories={categories} />
      </Suspense>
    </div>
  );
}