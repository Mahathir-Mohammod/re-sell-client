import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

// Route-level fallback: Next streams this while the page's server work finishes.
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}