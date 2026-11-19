"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AddProductPage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <RequireAuth roles={["seller", "admin"]}>
      <div className="max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add a product</h1>
          <p className="mt-1 text-sm text-ink-500">
            New listings are reviewed before they appear in search.
          </p>
        </header>
        <ProductForm categories={categories} />
      </div>
    </RequireAuth>
  );
}