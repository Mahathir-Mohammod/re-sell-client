import { Skeleton, TextSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <TextSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
