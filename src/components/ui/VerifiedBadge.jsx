import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Shown next to a seller's name wherever a product surfaces. The flag comes from the
// live user row, so un-verifying a seller updates every listing at once.
export function VerifiedBadge({ className, label = "Verified seller" }) {
  return (
    <span
      title={label}
      className={cn("inline-flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-300", className)}
    >
      <BadgeCheck className="size-3.5" aria-hidden />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </span>
  );
}
