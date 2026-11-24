import { cn } from "@/lib/utils";

// One block primitive; every skeleton below is composed from it so the loading
// state always matches the real layout's shape.
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800", className)} />;
}

export function TextSkeleton({ lines = 2, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function CardRowSkeleton({ rows = 3, height = "h-20" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={cn("rounded-2xl", height)} />
      ))}
    </div>
  );
}

export function PageHeadingSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}